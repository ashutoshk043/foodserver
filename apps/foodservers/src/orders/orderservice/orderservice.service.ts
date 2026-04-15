import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';

import { Orders, OrdersDocument } from '../schemas/orders.schema';
import { OrderItems, OrderItemsDocument } from '../schemas/order-items.schema';
import { StockLogs, StockLogsDocument } from '../schemas/stock-logs.schema';
import { CreateOrdersInput } from '../dtos/create-orders.input';
import { UpdateOrdersInput } from '../dtos/update-orders.input';

import { Recipe } from '../../ingredient-varient-recipe/schemas/recipe.schema';
import { RestaurantIngredientsStock } from '../../restaurant-ingredients-stock/schemas/restaurant-ingredients-stock.schema';
import { RestaurantVariantPrice } from '../../restaurant-variant-price/schemas/restaurant-variant-price.schema';
import { Coupons } from '../../coupons/schemas/coupons.schema';

const ACTIVE_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'];
const CANCELLED_STATUSES = ['CANCELLED'];

@Injectable()
export class OrderserviceService {
  constructor(
    @InjectConnection('restraurentconnection')
    private readonly connection: Connection,

    @InjectModel(Orders.name, 'restraurentconnection')
    private readonly ordersModel: Model<OrdersDocument>,

    @InjectModel(OrderItems.name, 'restraurentconnection')
    private readonly orderItemsModel: Model<OrderItemsDocument>,

    @InjectModel(StockLogs.name, 'restraurentconnection')
    private readonly stockLogsModel: Model<StockLogsDocument>,

    @InjectModel(Recipe.name, 'restraurentconnection')
    private readonly recipeModel: Model<any>,

    @InjectModel(RestaurantIngredientsStock.name, 'restraurentconnection')
    private readonly stockModel: Model<any>,

    @InjectModel(RestaurantVariantPrice.name, 'restraurentconnection')
    private readonly variantPriceModel: Model<any>,

    @InjectModel(Coupons.name, 'restraurentconnection')
    private readonly couponsModel: Model<any>,
  ) { }

  // ── Paginated List ────────────────────────────────────────
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'restaurants',
          let: { restaurantId: '$restaurantId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$restaurantId'] } } },
            { $project: { _id: 1, name: '$restaurantName' } },
          ],
          as: 'restaurant',
        },
      },
      { $unwind: '$restaurant' },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'items',
        },
      },
      {
        $project: {
          _id: 1, orderType: 1, status: 1, subTotal: 1,
          discount: 1, grandTotal: 1, paymentMode: 1,
          createdAt: 1, restaurant: 1, items: 1, orderNumber: 1,
        },
      },
      ...(search
        ? [{
          $match: {
            $or: [
              { orderType: { $regex: search, $options: 'i' } },
              { orderNumber: { $regex: search, $options: 'i' } },
              { status: { $regex: search, $options: 'i' } },
              { paymentMode: { $regex: search, $options: 'i' } },
              { 'restaurant.name': { $regex: search, $options: 'i' } },
            ],
          },
        }]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.ordersModel.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data, total, page, limit, totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // ── Create Order ──────────────────────────────────────────
  async create(input: CreateOrdersInput) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const restaurantId = new Types.ObjectId(input.restaurantId);
      const variantIds = input.items.map(i => new Types.ObjectId(i.variantId));

      // ── 1. Validate all variants in ONE query ────────────
      const variantPrices: any[] = await this.variantPriceModel
        .find({ restaurantId, variantId: { $in: variantIds }, isDeleted: false })
        .session(session)
        .lean();

      const variantPriceMap = new Map<string, any>(
        variantPrices.map(v => [v.variantId.toString(), v]),
      );

      for (const item of input.items) {
        const vp = variantPriceMap.get(item.variantId);

        if (!vp) {
          throw new Error(
            `Variant not found: variantId=${item.variantId} for restaurant=${input.restaurantId}`,
          );
        }
        if (!vp.isAvailable) {
          throw new Error(`Variant is not available: variantId=${item.variantId}`);
        }
        if (item.price !== vp.price) {
          throw new Error(
            `Price mismatch for variantId=${item.variantId}: ` +
            `frontend sent ₹${item.price}, DB has ₹${vp.price}`,
          );
        }
      }

      // ── 2. Compute totals ────────────────────────────────
      const subTotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
      const discount = input.discount || 0;
      const grandTotal = Math.max(0, subTotal - discount);

      // ── 3. Generate unique, collision-safe order number ──
      let orderNumber: string;
      let exists = true;

      do {
        // ── 3. Generate sequential order number ─────────────────
        orderNumber = await this.generateOrderNumber(session);
        exists = !!(await this.ordersModel.exists({ orderNumber }).session(session));
      } while (exists);

      // ── 4. Create order ──────────────────────────────────
      const [order] = await this.ordersModel.create(
        [{
          orderNumber,                         // ← human-readable ID
          restaurantId,
          orderType: input.orderType,
          status: input.status || 'ACCEPTED',
          subTotal,
          discount,
          grandTotal,
          paymentMode: input.paymentMode,
        }],
        { session },
      );

      const orderId = order._id as Types.ObjectId;

      // ── 5. Save order items ──────────────────────────────
      await this.orderItemsModel.insertMany(
        input.items.map(i => ({
          orderNumber,   // ← denormalized for easier debugging & reporting
          orderId,
          restaurantId,
          productId: new Types.ObjectId(i.productId),
          variantId: new Types.ObjectId(i.variantId),
          quantity: i.quantity,
          price: i.price,
        })),
        { session },
      );

      // ── 6. Deduct inventory ──────────────────────────────
      await this.applyInventory(orderId, restaurantId, input.items, 'DEDUCT', session, orderNumber);

      await session.commitTransaction();

      console.log(`✅ Order ${orderNumber} (${orderId}) created | ₹${grandTotal} | ${input.items.length} items`);

      return order;

    } catch (err) {
      await session.abortTransaction();
      console.error('❌ create() rolled back:', err.message);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  // ── Update Order ──────────────────────────────────────────
  async update(input: UpdateOrdersInput) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const { _id, ...rest } = input;
      const orderId = new Types.ObjectId(_id);

      const existingOrder = await this.ordersModel
        .findById(orderId)
        .session(session)
        .lean();

      if (!existingOrder) throw new Error(`Order ${_id} not found`);

      const restaurantId = existingOrder.restaurantId as Types.ObjectId;
      const oldStatus = existingOrder.status;
      const newStatus = rest.status;

      console.log(`📝 Update Order ${_id} | oldStatus=${oldStatus} newStatus=${newStatus || 'unchanged'}`);

      // ── SCENARIO 1: Active → CANCELLED ──────────────────
      if (
        ACTIVE_STATUSES.includes(oldStatus) &&
        newStatus && CANCELLED_STATUSES.includes(newStatus)
      ) {
        console.log('🔄 SCENARIO 1: Order cancelled → restoring inventory');

        const oldItems = await this.orderItemsModel.find({ orderId }).session(session).lean();
        await this.applyInventory(
          orderId, restaurantId,
          oldItems.map((i: any) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
          'RESTORE', session,
          existingOrder.orderNumber // ← pass the order number
        );
      }

      // ── SCENARIO 2: CANCELLED → Active ──────────────────
      else if (
        CANCELLED_STATUSES.includes(oldStatus) &&
        newStatus && ACTIVE_STATUSES.includes(newStatus)
      ) {
        console.log('🔄 SCENARIO 2: Order re-activated → re-deducting inventory');

        const oldItems = await this.orderItemsModel.find({ orderId }).session(session).lean();
        await this.applyInventory(
          orderId, restaurantId,
          oldItems.map((i: any) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
          'DEDUCT', session, existingOrder.orderNumber
        );
      }

      // ── SCENARIO 3: Items changed ────────────────────────
      else if (rest.items && rest.items.length > 0 && ACTIVE_STATUSES.includes(oldStatus)) {
        console.log('🔄 SCENARIO 3: Items changed → reversing old, applying new');

        const oldItems = await this.orderItemsModel.find({ orderId }).session(session).lean();

        // Restore old → delete old → insert new → deduct new (all batched)
        await this.applyInventory(
          orderId, restaurantId,
          oldItems.map((i: any) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
          'RESTORE', session, existingOrder.orderNumber
        );

        await this.orderItemsModel.deleteMany({ orderId }, { session });

        await this.orderItemsModel.insertMany(
          rest.items.map((i: any) => ({
            orderId,
            restaurantId,
            productId: new Types.ObjectId(i.productId),
            variantId: new Types.ObjectId(i.variantId),
            quantity: i.quantity,
            price: i.price,
          })),
          { session },
        );

        await this.applyInventory(orderId, restaurantId, rest.items, 'DEDUCT', session, existingOrder.orderNumber);

        const newSubTotal = rest.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
        const newDiscount = rest.discount ?? existingOrder.discount ?? 0;
        rest.subTotal = newSubTotal;
        rest.grandTotal = Math.max(0, newSubTotal - newDiscount);
        rest.discount = newDiscount;
        delete rest.items;
      }

      const updated = await this.ordersModel.findByIdAndUpdate(
        orderId,
        { $set: rest },
        { new: true, session },
      );

      await session.commitTransaction();

      console.log(`✅ Order ${_id} updated | newStatus=${updated?.status}`);

      return updated;

    } catch (err) {
      await session.abortTransaction();
      console.error('❌ update() rolled back:', err.message);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  // ── Soft Delete ───────────────────────────────────────────
  async remove(id: string) {
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const orderId = new Types.ObjectId(id);
      const order = await this.ordersModel.findById(orderId).session(session).lean();

      if (order && ACTIVE_STATUSES.includes(order.status)) {
        const items = await this.orderItemsModel.find({ orderId }).session(session).lean();

        await this.applyInventory(
          orderId,
          order.restaurantId as Types.ObjectId,
          items.map((i: any) => ({ variantId: i.variantId.toString(), quantity: i.quantity })),
          'RESTORE',
          session,
          order.orderNumber
        );
      }

      await this.ordersModel.findByIdAndUpdate(orderId, { $set: { isDeleted: true } }, { session });

      await session.commitTransaction();

      return true;

    } catch (err) {
      await session.abortTransaction();
      console.error('❌ remove() rolled back:', err.message);
      throw err;
    } finally {
      await session.endSession();
    }
  }

  // ════════════════════════════════════════════════════════
  // CORE: Apply Inventory — batched, single-pass
  // ════════════════════════════════════════════════════════
  private async applyInventory(
    orderId: Types.ObjectId,
    restaurantId: Types.ObjectId,
    items: Array<{ variantId: string; quantity: number }>,
    mode: 'DEDUCT' | 'RESTORE',
    session: ClientSession,
    orderNumber: string,
  ) {
    console.log(`🔧 applyInventory [${mode}] START`);

    const variantIds = items.map(i => new Types.ObjectId(i.variantId));

    // ── 1. Fetch ALL recipes in one query ────────────────
    const recipes: any[] = await this.recipeModel
      .find({ variantId: { $in: variantIds }, isDeleted: { $ne: true }, isActive: true })
      .session(session)
      .lean();

    // Group recipes by variantId for O(1) lookup
    const recipeMap = new Map<string, any[]>();
    for (const r of recipes) {
      const key = r.variantId.toString();
      const list = recipeMap.get(key) ?? [];
      list.push(r);
      recipeMap.set(key, list);
    }

    // Validate all variants have recipes before touching stock
    for (const item of items) {
      if (!recipeMap.has(item.variantId)) {
        throw new Error(`No recipe found for variantId=${item.variantId} — order cannot be placed`);
      }
    }

    // ── 2. Resolve all required ingredient changes ───────
    // Map: ingredientId → { totalChange, alertLevel (from stock) }
    const ingredientChangeMap = new Map<string, number>();

    for (const item of items) {
      const itemRecipes = recipeMap.get(item.variantId) || [];

      for (const recipe of itemRecipes) {
        const key = recipe.ingredientId.toString();
        const requiredQty = recipe.quantity * item.quantity;
        const changeQty = mode === 'DEDUCT' ? -requiredQty : +requiredQty;

        ingredientChangeMap.set(key, (ingredientChangeMap.get(key) || 0) + changeQty);
      }
    }

    const ingredientIds = [...ingredientChangeMap.keys()].map(id => new Types.ObjectId(id));

    // ── 3. Fetch ALL stock entries in one query ──────────
    const stockEntries: any[] = await this.stockModel
      .find({ restaurantId, ingredientId: { $in: ingredientIds } })
      .session(session)
      .lean();

    const stockMap = new Map<string, any>(
      stockEntries.map(s => [s.ingredientId.toString(), s]),
    );

    // ── 4. Validate before writing ───────────────────────
    for (const [ingredientIdStr, changeQty] of ingredientChangeMap) {
      const stock = stockMap.get(ingredientIdStr);

      if (!stock) {
        throw new Error(`Stock entry missing for ingredient=${ingredientIdStr}`);
      }

      if (mode === 'DEDUCT' && stock.availableQty + changeQty < 0) {
        throw new Error(
          `Insufficient stock for ingredient=${ingredientIdStr}: ` +
          `available=${stock.availableQty}, required=${Math.abs(changeQty)}`,
        );
      }
    }

    // ── 5. Bulk update all stock in ONE roundtrip ────────
    await this.stockModel.bulkWrite(
      [...ingredientChangeMap.entries()].map(([ingredientIdStr, changeQty]) => ({
        updateOne: {
          filter: { _id: stockMap.get(ingredientIdStr)._id },
          update: { $inc: { availableQty: changeQty } },
        },
      })),
      { session },
    );

    // ── 6. Log & warn (in memory, no extra DB calls) ─────
    const stockLogDocs: any[] = [];

    for (const [ingredientIdStr, changeQty] of ingredientChangeMap) {
      const stock = stockMap.get(ingredientIdStr);
      const newQty = stock.availableQty + changeQty;

      console.log(
        `${mode === 'DEDUCT' ? '📉' : '📈'} ${mode}: ingredient=${ingredientIdStr}` +
        ` | ${stock.availableQty} → ${newQty}`,
      );

      if (mode === 'DEDUCT' && newQty <= stock.alertLevel) {
        console.warn(`🔔 LOW STOCK: ingredient=${ingredientIdStr} qty=${newQty} alert=${stock.alertLevel}`);
      }

      stockLogDocs.push({
        restaurantId,
        ingredientId: new Types.ObjectId(ingredientIdStr),
        changeQty,
        reason: mode === 'DEDUCT' ? 'ORDER' : 'RETURN',
        referenceId: orderId,
        note: `${mode} for order ${orderNumber}`,  // ← was orderId, now orderNumber
        orderNumber,                                // ← new field
      });
    }

    // ── 7. Insert ALL stock logs in ONE query ────────────
    await this.stockLogsModel.insertMany(stockLogDocs, { session });

    console.log(`✅ applyInventory [${mode}] COMPLETE`);
  }

  // ── Utility: generate unique order number ────────────────
  private async generateOrderNumber(session: ClientSession): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // "20250324"
    const prefix = `ORD-${today}-`;

    // Count today's orders to get the next sequence number
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const count = await this.ordersModel
      .countDocuments({ createdAt: { $gte: todayStart } })
      .session(session);

    const sequence = String(count + 1).padStart(4, '0'); // "0001", "0042", "1000"
    return `${prefix}${sequence}`;                        // "ORD-20250324-0001"
  }
}