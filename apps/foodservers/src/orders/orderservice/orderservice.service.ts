// import { Injectable, BadRequestException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';

// import { Orders, OrdersDocument }         from '../schemas/orders.schema';
// import { OrderItems, OrderItemsDocument } from '../schemas/order-items.schema';
// import { StockLogs, StockLogsDocument }   from '../schemas/stock-logs.schema';
// import { CreateOrdersInput }              from '../dtos/create-orders.input';
// import { UpdateOrdersInput }              from '../dtos/update-orders.input';

// @Injectable()
// export class OrderserviceService {
//   constructor(
//     @InjectModel(Orders.name, 'restraurentconnection')
//     private readonly ordersModel: Model<OrdersDocument>,

//     @InjectModel(OrderItems.name, 'restraurentconnection')
//     private readonly orderItemsModel: Model<OrderItemsDocument>,

//     @InjectModel(StockLogs.name, 'restraurentconnection')
//     private readonly stockLogsModel: Model<StockLogsDocument>,

//     // ── We need these 2 collections to deduct stock ───────
//     // recipes = variant_ingredients
//     // stock   = restaurant_ingredients
//     @InjectModel('Recipe', 'restraurentconnection')
//     private readonly recipeModel: Model<any>,

//     @InjectModel('RestaurantIngredientsStock', 'restraurentconnection')
//     private readonly stockModel: Model<any>,
//   ) {}

//   // ── Paginated List ───────────────────────────────────────
//   async findAll(page = 1, limit = 10, search = '') {
//     const skip = (page - 1) * limit;

//     const pipeline: any[] = [
//       { $match: { isDeleted: false } },

//       {
//         $lookup: {
//           from: 'restaurants',
//           let: { restaurantId: '$restaurantId' },
//           pipeline: [
//             { $match: { $expr: { $eq: ['$_id', '$$restaurantId'] } } },
//             { $project: { _id: 1, name: '$restaurantName' } },
//           ],
//           as: 'restaurant',
//         },
//       },
//       { $unwind: '$restaurant' },

//       // ── Join order items ─────────────────────────────────
//       {
//         $lookup: {
//           from: 'orderitems',
//           localField: '_id',
//           foreignField: 'orderId',
//           as: 'items',
//         },
//       },

//       {
//         $project: {
//           _id: 1,
//           orderType: 1,
//           status: 1,
//           subTotal: 1,
//           discount: 1,
//           grandTotal: 1,
//           paymentMode: 1,
//           createdAt: 1,
//           restaurant: 1,
//           items: 1,
//         },
//       },

//       ...(search
//         ? [
//             {
//               $match: {
//                 $or: [
//                   { orderType:         { $regex: search, $options: 'i' } },
//                   { status:            { $regex: search, $options: 'i' } },
//                   { paymentMode:       { $regex: search, $options: 'i' } },
//                   { 'restaurant.name': { $regex: search, $options: 'i' } },
//                 ],
//               },
//             },
//           ]
//         : []),

//       { $sort: { createdAt: -1 } },

//       {
//         $facet: {
//           data:       [{ $skip: skip }, { $limit: limit }],
//           totalCount: [{ $count: 'count' }],
//         },
//       },
//     ];

//     const result     = await this.ordersModel.aggregate(pipeline);
//     const data       = result[0].data;
//     const total      = result[0].totalCount[0]?.count || 0;
//     const totalPages = Math.ceil(total / limit);

//     return {
//       data, total, page, limit, totalPages,
//       hasNextPage: page < totalPages,
//       hasPrevPage: page > 1,
//     };
//   }

//   // ── Create Order + Items + Deduct Stock ──────────────────
//   async create(input: CreateOrdersInput) {
//     const restaurantId = new Types.ObjectId(input.restaurantId);

//     // ── Step 1: Calculate subTotal from items ────────────
//     const subTotal   = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
//     const discount   = input.discount || 0;
//     const grandTotal = Math.max(0, subTotal - discount);

//     // ── Step 2: Save Order ────────────────────────────────
//     const order = await new this.ordersModel({
//       restaurantId,
//       orderType:   input.orderType,
//       status:      input.status || 'ACCEPTED',
//       subTotal,
//       discount,
//       grandTotal,
//       paymentMode: input.paymentMode,
//     }).save();

//     const orderId = order._id as Types.ObjectId;

//     // ── Step 3: Save Order Items ──────────────────────────
//     const orderItemDocs = input.items.map(i => ({
//       orderId,
//       restaurantId,
//       productId: new Types.ObjectId(i.productId),
//       variantId: new Types.ObjectId(i.variantId),
//       quantity:  i.quantity,
//       price:     i.price,
//     }));

//     await this.orderItemsModel.insertMany(orderItemDocs);

//     // ── Step 4: Deduct Inventory ──────────────────────────
//     await this.deductInventory(orderId, restaurantId, input.items);

//     console.log(`Order ${orderId} created | ₹${grandTotal} | ${input.items.length} item(s)`);

//     return order;
//   }

//   // ── Inventory Deduction Engine ───────────────────────────
// private async deductInventory(
//   orderId:      Types.ObjectId,
//   restaurantId: Types.ObjectId,
//   items:        Array<{ variantId: string; quantity: number }>,
// ) {
// //   console.log('🔧 deductInventory START', JSON.stringify({ orderId, restaurantId, items }, null, 2));

//   for (const item of items) {
//     const variantId = new Types.ObjectId(item.variantId);

//     // console.log('📦 Processing item:', JSON.stringify({ variantId: variantId.toString(), quantity: item.quantity }));

//     const recipes = await this.recipeModel.find({
//       variantId,
//       isDeleted: { $ne: true },
//       isActive:  true,
//     }).lean();

//     // console.log(`📋 Recipes found for variant ${variantId}:`, JSON.stringify(recipes, null, 2));

//     if (!recipes.length) {
//       console.warn(`⚠️ No recipe found for variantId=${variantId} — skipping inventory deduction`);
//       continue;
//     }

//     for (const recipe of recipes) {
//       const ingredientId = recipe.ingredientId as Types.ObjectId;
//       const requiredQty  = recipe.quantity * item.quantity;

//     //   console.log('🧪 Recipe detail:', JSON.stringify({
//     //     recipeId:      recipe._id,
//     //     ingredientId:  ingredientId.toString(),
//     //     recipeQty:     recipe.quantity,
//     //     orderQty:      item.quantity,
//     //     requiredQty,
//     //   }));

//       const stockEntry = await this.stockModel.findOne({ restaurantId, ingredientId });

//     //   console.log('🏪 Stock entry found:', JSON.stringify(stockEntry, null, 2));

//       if (!stockEntry) {
//         console.warn(`❌ Stock entry MISSING: restaurant=${restaurantId} ingredient=${ingredientId}`);
//         continue;
//       }

//       const newQty = stockEntry.availableQty - requiredQty;

//     //   console.log('📉 Stock deduction calc:', JSON.stringify({
//     //     ingredientId:   ingredientId.toString(),
//     //     before:         stockEntry.availableQty,
//     //     deducting:      requiredQty,
//     //     after:          newQty,
//     //     alertLevel:     stockEntry.alertLevel,
//     //   }));

//       await this.stockModel.findByIdAndUpdate(
//         stockEntry._id,
//         { $inc: { availableQty: -requiredQty } },
//       );

//     //   console.log(`✅ Stock updated for ingredient=${ingredientId} | ${stockEntry.availableQty} → ${newQty}`);

//       if (newQty < 0) {
//         console.warn(`🔴 NEGATIVE STOCK: ingredient=${ingredientId} newQty=${newQty}`);
//       }

//       if (newQty <= stockEntry.alertLevel) {
//         console.warn(`🔔 LOW STOCK ALERT: ingredient=${ingredientId} qty=${newQty} alertLevel=${stockEntry.alertLevel}`);
//       }

//       const log = await new this.stockLogsModel({
//         restaurantId,
//         ingredientId,
//         changeQty:   -requiredQty,
//         reason:      'ORDER',
//         referenceId: orderId,
//         note:        `Auto deducted for order ${orderId}`,
//       }).save();

//       // console.log('📝 Stock log saved:', JSON.stringify(log, null, 2));
//     }
//   }

// //   console.log('✅ deductInventory COMPLETE for orderId:', orderId.toString());
// }
//   // ── Update Order Status ──────────────────────────────────
//   async update(input: UpdateOrdersInput) {
//     const { _id, ...rest } = input;

//     return this.ordersModel.findByIdAndUpdate(
//       new Types.ObjectId(_id),
//       { $set: rest },
//       { new: true },
//     );
//   }

//   // ── Soft Delete ──────────────────────────────────────────
//   async remove(id: string) {
//     await this.ordersModel.findByIdAndUpdate(
//       new Types.ObjectId(id),
//       { $set: { isDeleted: true } },
//     );
//     return true;
//   }
// }

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Orders, OrdersDocument }         from '../schemas/orders.schema';
import { OrderItems, OrderItemsDocument } from '../schemas/order-items.schema';
import { StockLogs, StockLogsDocument }   from '../schemas/stock-logs.schema';
import { CreateOrdersInput }              from '../dtos/create-orders.input';
import { UpdateOrdersInput }              from '../dtos/update-orders.input';

import { Recipe }                    from '../../ingredient-varient-recipe/schemas/recipe.schema';
import { RestaurantIngredientsStock } from '../../restaurant-ingredients-stock/schemas/restaurant-ingredients-stock.schema';

// ── Status groups ────────────────────────────────────────
const ACTIVE_STATUSES    = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'];
const CANCELLED_STATUSES = ['CANCELLED'];

@Injectable()
export class OrderserviceService {
  constructor(
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
  ) {}

  // ── Paginated List ───────────────────────────────────────
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
          _id: 1,
          orderType: 1,
          status: 1,
          subTotal: 1,
          discount: 1,
          grandTotal: 1,
          paymentMode: 1,
          createdAt: 1,
          restaurant: 1,
          items: 1,
        },
      },

      ...(search
        ? [{
            $match: {
              $or: [
                { orderType:         { $regex: search, $options: 'i' } },
                { status:            { $regex: search, $options: 'i' } },
                { paymentMode:       { $regex: search, $options: 'i' } },
                { 'restaurant.name': { $regex: search, $options: 'i' } },
              ],
            },
          }]
        : []),

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data:       [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result     = await this.ordersModel.aggregate(pipeline);
    const data       = result[0].data;
    const total      = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data, total, page, limit, totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // ── Create Order ─────────────────────────────────────────
  async create(input: CreateOrdersInput) {
    const restaurantId = new Types.ObjectId(input.restaurantId);

    const subTotal   = input.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount   = input.discount || 0;
    const grandTotal = Math.max(0, subTotal - discount);

    const order = await new this.ordersModel({
      restaurantId,
      orderType:   input.orderType,
      status:      input.status || 'ACCEPTED',
      subTotal,
      discount,
      grandTotal,
      paymentMode: input.paymentMode,
    }).save();

    const orderId = order._id as Types.ObjectId;

    // ── Save order items ─────────────────────────────────
    const orderItemDocs = input.items.map(i => ({
      orderId,
      restaurantId,
      productId: new Types.ObjectId(i.productId),
      variantId: new Types.ObjectId(i.variantId),
      quantity:  i.quantity,
      price:     i.price,
    }));

    await this.orderItemsModel.insertMany(orderItemDocs);

    // ── Deduct inventory ─────────────────────────────────
    await this.applyInventory(orderId, restaurantId, input.items, 'DEDUCT');

    console.log(`✅ Order ${orderId} created | ₹${grandTotal} | ${input.items.length} items`);

    return order;
  }

  // ── Update Order ─────────────────────────────────────────
  async update(input: UpdateOrdersInput) {
    const { _id, ...rest } = input;
    const orderId = new Types.ObjectId(_id);

    // ── Fetch existing order ─────────────────────────────
    const existingOrder = await this.ordersModel.findById(orderId).lean();

    if (!existingOrder) throw new Error(`Order ${_id} not found`);

    const restaurantId  = existingOrder.restaurantId as Types.ObjectId;
    const oldStatus     = existingOrder.status;
    const newStatus     = rest.status;

    console.log(`📝 Update Order ${_id} | oldStatus=${oldStatus} newStatus=${newStatus || 'unchanged'}`);

    // ═══════════════════════════════════════════════════════
    // SCENARIO 1: Active → CANCELLED
    // Restore all inventory back
    // ═══════════════════════════════════════════════════════
    if (
      ACTIVE_STATUSES.includes(oldStatus) &&
      newStatus && CANCELLED_STATUSES.includes(newStatus)
    ) {
      console.log('🔄 SCENARIO 1: Order cancelled → restoring inventory');

      const oldItems = await this.orderItemsModel
        .find({ orderId })
        .lean();

      const itemsForRestore = oldItems.map((i: any) => ({
        variantId: i.variantId.toString(),
        quantity:  i.quantity,
      }));

      await this.applyInventory(orderId, restaurantId, itemsForRestore, 'RESTORE');
    }

    // ═══════════════════════════════════════════════════════
    // SCENARIO 2: CANCELLED → Active (re-activate)
    // Re-deduct inventory
    // ═══════════════════════════════════════════════════════
    else if (
      CANCELLED_STATUSES.includes(oldStatus) &&
      newStatus && ACTIVE_STATUSES.includes(newStatus)
    ) {
      console.log('🔄 SCENARIO 2: Order re-activated → re-deducting inventory');

      const oldItems = await this.orderItemsModel
        .find({ orderId })
        .lean();

      const itemsForDeduct = oldItems.map((i: any) => ({
        variantId: i.variantId.toString(),
        quantity:  i.quantity,
      }));

      await this.applyInventory(orderId, restaurantId, itemsForDeduct, 'DEDUCT');
    }

    // ═══════════════════════════════════════════════════════
    // SCENARIO 3: Edit items (new items provided)
    // Reverse old → apply new
    // ═══════════════════════════════════════════════════════
    else if (rest.items && rest.items.length > 0 && ACTIVE_STATUSES.includes(oldStatus)) {
      console.log('🔄 SCENARIO 3: Items changed → reversing old, applying new');

      // Step A: Restore old items
      const oldItems = await this.orderItemsModel.find({ orderId }).lean();
      const oldForRestore = oldItems.map((i: any) => ({
        variantId: i.variantId.toString(),
        quantity:  i.quantity,
      }));
      await this.applyInventory(orderId, restaurantId, oldForRestore, 'RESTORE');

      // Step B: Delete old order items
      await this.orderItemsModel.deleteMany({ orderId });

      // Step C: Save new order items
      const newItemDocs = rest.items.map((i: any) => ({
        orderId,
        restaurantId,
        productId: new Types.ObjectId(i.productId),
        variantId: new Types.ObjectId(i.variantId),
        quantity:  i.quantity,
        price:     i.price,
      }));
      await this.orderItemsModel.insertMany(newItemDocs);

      // Step D: Deduct new items
      await this.applyInventory(orderId, restaurantId, rest.items, 'DEDUCT');

      // Step E: Recalculate totals
      const newSubTotal   = rest.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
      const newDiscount   = rest.discount ?? existingOrder.discount ?? 0;
      const newGrandTotal = Math.max(0, newSubTotal - newDiscount);

      rest.subTotal   = newSubTotal;
      rest.grandTotal = newGrandTotal;
      rest.discount   = newDiscount;

      // Remove items from rest so it's not saved in order doc
      delete rest.items;
    }

    // ── Save updated order ───────────────────────────────
    const updated = await this.ordersModel.findByIdAndUpdate(
      orderId,
      { $set: rest },
      { new: true },
    );

    console.log(`✅ Order ${_id} updated | newStatus=${updated?.status}`);

    return updated;
  }

  // ── Soft Delete ──────────────────────────────────────────
  async remove(id: string) {
    const orderId = new Types.ObjectId(id);

    const order = await this.ordersModel.findById(orderId).lean();

    if (order && ACTIVE_STATUSES.includes(order.status)) {
      console.log('🗑️ Delete: restoring inventory before soft delete');

      const items = await this.orderItemsModel.find({ orderId }).lean();
      const itemsForRestore = items.map((i: any) => ({
        variantId: i.variantId.toString(),
        quantity:  i.quantity,
      }));

      await this.applyInventory(orderId, order.restaurantId as Types.ObjectId, itemsForRestore, 'RESTORE');
    }

    await this.ordersModel.findByIdAndUpdate(orderId, { $set: { isDeleted: true } });

    return true;
  }

  // ════════════════════════════════════════════════════════
  // CORE: Apply Inventory — DEDUCT or RESTORE
  // ════════════════════════════════════════════════════════
  private async applyInventory(
    orderId:      Types.ObjectId,
    restaurantId: Types.ObjectId,
    items:        Array<{ variantId: string; quantity: number }>,
    mode:         'DEDUCT' | 'RESTORE',
  ) {
    console.log(`🔧 applyInventory [${mode}] START`, JSON.stringify({ orderId, items }));

    for (const item of items) {
      const variantId = new Types.ObjectId(item.variantId);

      const recipes = await this.recipeModel.find({
        variantId,
        isDeleted: { $ne: true },
        isActive:  true,
      }).lean();

      if (!recipes.length) {
        console.warn(`⚠️ No recipe for variantId=${variantId} — skipping`);
        continue;
      }

      for (const recipe of recipes) {
        const ingredientId = recipe.ingredientId as Types.ObjectId;
        const requiredQty  = recipe.quantity * item.quantity;

        // DEDUCT = negative, RESTORE = positive
        const changeQty = mode === 'DEDUCT' ? -requiredQty : +requiredQty;

        const stockEntry = await this.stockModel.findOne({ restaurantId, ingredientId });

        if (!stockEntry) {
          console.warn(`❌ Stock entry missing: ingredient=${ingredientId}`);
          continue;
        }

        // ── Update stock ────────────────────────────────
        await this.stockModel.findByIdAndUpdate(
          stockEntry._id,
          { $inc: { availableQty: changeQty } },
        );

        const newQty = stockEntry.availableQty + changeQty;

        console.log(`${mode === 'DEDUCT' ? '📉' : '📈'} Stock ${mode}: ingredient=${ingredientId} | ${stockEntry.availableQty} → ${newQty}`);

        if (mode === 'DEDUCT') {
          if (newQty < 0)
            console.warn(`🔴 NEGATIVE STOCK: ingredient=${ingredientId} qty=${newQty}`);
          if (newQty <= stockEntry.alertLevel)
            console.warn(`🔔 LOW STOCK: ingredient=${ingredientId} qty=${newQty} alert=${stockEntry.alertLevel}`);
        }

        // ── Write stock log ─────────────────────────────
        await new this.stockLogsModel({
          restaurantId,
          ingredientId,
          changeQty,
          reason:      mode === 'DEDUCT' ? 'ORDER' : 'RETURN',
          referenceId: orderId,
          note:        `${mode} for order ${orderId}`,
        }).save();
      }
    }

    console.log(`✅ applyInventory [${mode}] COMPLETE`);
  }
}