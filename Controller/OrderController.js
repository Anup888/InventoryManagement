const assert = require("assert"); // N.B: Assert module comes bundled with Node.js.

const {
  countryByPassport,
  orderByCountryQty,
  orderByCountryQtyInlmt,
} = require("./../Utils/Helper");
const { Inventory } = require("./../Utils/Constants");

/**
 * @function  [addOrder]
 * @returns {String} Status
 */
const addOrder = async (order) => {
  const { country, passport, product, quantity, product2, quantity2 } = order;
  let productType1 = ""; // Mask
  let productType2 = ""; // Gloves
  let product1Qty = 0; // mask quantity
  let product2Qty = 0; // gloves quantity
  let passportCountry = null;
  let remainingMaskUK = 0;
  let remainingMaskGer = 0;
  let maskAmount = 0;
  let remainingGlovesUK = 0;
  let remainingGlovesGer = 0;
  let glovesAmount = 0;
  if (product === "Mask") {
    productType1 = product;
    product1Qty = quantity;
    productType2 = product2;
    product2Qty = quantity2;
  }
  if (product2 === "Mask") {
    productType1 = product2;
    product1Qty = quantity2;
    productType2 = product;
    product2Qty = quantity;
  }
  if (passport) {
    passportCountry = countryByPassport(passport);
  }

  // console.info(productType1, productType2);
  // complete Mask details from invesntory
  const maskInventory = await Inventory.filter(
    (item) => item.product === "Mask"
  );
  // sum of all mask from all inventory
  const totalMask = await maskInventory.reduce((a, b) => {
    return a + b.quantity;
  }, 0);
  // mask by country argument
  const totalMaskByCountry = maskInventory.find(
    (mask) => mask.country === country
  );
  const totalMaskByPassportCountry = maskInventory.find(
    (mask) => mask.country === passportCountry
  );
  // if order for mask is in limit
  if (product1Qty <= totalMaskByCountry.quantity) {
    if (country === "UK" && (passportCountry === "UK" || !passportCountry)) {
      remainingMaskUK = totalMaskByCountry.quantity - product1Qty;
      maskAmount = product1Qty * totalMaskByCountry.price;
      remainingMaskGer = totalMask - totalMaskByCountry.quantity;
    }
    if (
      country === "GERMANY" &&
      (passportCountry === "GERMANY" || !passportCountry)
    ) {
      remainingMaskGer = totalMaskByCountry.quantity - product1Qty;
      maskAmount = product1Qty * totalMaskByCountry.price;
      remainingMaskUK = totalMask - totalMaskByCountry.quantity;
    }
    if (country === "UK" && passportCountry === "GERMANY") {
      let foreignCountryQTY = totalMask - totalMaskByCountry.quantity;
      let obc = orderByCountryQtyInlmt(product1Qty, foreignCountryQTY);
      remainingMaskGer = totalMaskByCountry.quantity - obc.productQty1;
      remainingMaskUK = foreignCountryQTY - obc.productQty2;
      maskAmount = obc.productQty1 * totalMaskByCountry.price;
      maskAmount += obc.productQty2 * totalMaskByPassportCountry.price;
      if (country === "UK") {
        maskAmount += obc.productQty1 * 400 * (20 / 100);
      }
      if (passportCountry === "GERMANY") {
        maskAmount += obc.productQty1 * 400;
      }
    }
    if (country === "GERMANY" && passportCountry === "UK") {
      let foreignCountryQTY = totalMask - totalMaskByCountry.quantity;
      // console.info("passportCountry", foreignCountryQTY);
      let obc = orderByCountryQtyInlmt(product1Qty, foreignCountryQTY);
      // console.info("Ger,UK", obc);
      remainingMaskUK = foreignCountryQTY - obc.productQty2;
      remainingMaskGer = totalMaskByCountry.quantity - obc.productQty1;
      maskAmount = obc.productQty1 * totalMaskByCountry.price;
      maskAmount += obc.productQty2 * totalMaskByPassportCountry.price;
      if (country === "GERMANY") {
        maskAmount += obc.productQty1 * 400 * (20 / 100);
      }
      if (passportCountry === "UK") {
        maskAmount += obc.productQty1 * 400;
      }
    }
  }
  // if order for mask in more then limit by country
  if (totalMaskByCountry.quantity < product1Qty && product1Qty <= totalMask) {
    // console.info("inside 70");
    let obc = await orderByCountryQty(product1Qty, totalMaskByCountry.quantity);
    // console.info("obc", obc);
    let orderByCountryFinalQty = obc.productQty;
    let orderByForeignCountryQty = product1Qty - orderByCountryFinalQty;
    // while (orderByCountry <= totalMaskByCountry.quantity);
    if (country === "UK") {
      remainingMaskUK = totalMaskByCountry.quantity - orderByCountryFinalQty;
      remainingMaskGer =
        totalMask - totalMaskByCountry.quantity - orderByForeignCountryQty;
      maskAmount = orderByCountryFinalQty * totalMaskByCountry.price;
      if (passportCountry === "UK") {
        // maskAmount += productobc * 400;
      }
      if (passportCountry === "GERMANY") {
        maskAmount += orderByForeignCountryQty * 400 * (20 / 100);
      }
    }
    if (country === "GERMANY") {
      remainingMaskUK =
        totalMask - totalMaskByCountry.quantity - orderByForeignCountryQty;
      remainingMaskGer = totalMaskByCountry.quantity - orderByCountryFinalQty;
      maskAmount = orderByCountryFinalQty * totalMaskByCountry.price;
      if (passportCountry === "GERMANY") {
        // maskAmount += obc * 400;
      }
      if (passportCountry === "UK") {
        maskAmount += orderByForeignCountryQty * 400 * (20 / 100);
      }
    }
  }

  const glovesInventory = await Inventory.filter(
    (item) => item.product === "Gloves"
  );
  const totalGloves = await glovesInventory.reduce((a, b) => {
    return a + b.quantity;
  }, 0);
  const totalGlovesByCountry = glovesInventory.find(
    (gloves) => gloves.country === country
  );
  const totalGlovesByPassportCountry = glovesInventory.find(
    (gloves) => gloves.country === passportCountry
  );
  // if order for gloves is in limit
  if (product2Qty <= totalGlovesByCountry.quantity) {
    // console.info("order is in limit for gloves");
    if (country === "UK" && (passportCountry === "UK" || !passportCountry)) {
      remainingGlovesUK = totalGlovesByCountry.quantity - product2Qty;
      glovesAmount = product2Qty * totalGlovesByCountry.price;
      remainingGlovesGer = totalGloves - totalGlovesByCountry.quantity;
    }
    if (
      country === "GERMANY" &&
      (passportCountry === "GERMANY" || !passportCountry)
    ) {
      remainingGlovesUK = totalGloves - totalGlovesByCountry.quantity;
      glovesAmount = product2Qty * totalGlovesByCountry.price;
      remainingGlovesGer = totalGlovesByCountry.quantity - product2Qty;
    }

    if (country === "UK" && passportCountry === "GERMANY") {
      let foreignCountryQTY = totalGloves - totalGlovesByCountry.quantity;
      let obc = orderByCountryQtyInlmt(product2Qty, foreignCountryQTY);
      remainingGlovesGer = totalGlovesByCountry.quantity - obc.productQty2;
      remainingGlovesUK = foreignCountryQTY - obc.productQty1;
      glovesAmount = obc.productQty1 * totalGlovesByCountry.price;
      glovesAmount += obc.productQty2 * totalGlovesByPassportCountry.price;
      if (country === "UK") {
        maskAmount += obc.productQty1 * 400 * (20 / 100);
      }
      if (passportCountry === "GERMANY") {
        maskAmount += obc.productQty1 * 400;
      }
    }
    if (country === "GERMANY" && passportCountry === "UK") {
      let foreignCountryQTY = totalGloves - totalGlovesByCountry.quantity;
      // console.info("passportCountry", foreignCountryQTY);
      let obc = orderByCountryQtyInlmt(product2Qty, foreignCountryQTY);
      // console.info("Ger,UK", obc);
      remainingGlovesUK = foreignCountryQTY - obc.productQty2;
      remainingGlovesGer = totalGlovesByCountry.quantity - obc.productQty1;
      glovesAmount = obc.productQty1 * totalGlovesByCountry.price;
      glovesAmount += obc.productQty2 * totalGlovesByPassportCountry.price;
      if (country === "GERMANY") {
        maskAmount += obc.productQty1 * 400 * (20 / 100);
      }
      if (passportCountry === "UK") {
        maskAmount += obc.productQty1 * 400;
      }
    }
    // console.info("gloves", glovesAmount, remainingGlovesUK, remainingGlovesGer);
  }
  // if order for gloves is more then limit by country
  if (
    totalGlovesByCountry.quantity < product2Qty &&
    product2Qty <= totalGloves
  ) {
    // console.info("inside 70");
    let obc = await orderByCountryQty(
      product2Qty,
      totalGlovesByCountry.quantity
    );
    // console.info("obc", obc);
    let orderByCountryFinalQty = obc.productQty;
    let orderByForeignCountryQty = product2Qty - orderByCountryFinalQty;
    // while (orderByCountry <= totalMaskByCountry.quantity);
    if (country === "UK") {
      remainingGlovesUK =
        totalGlovesByCountry.quantity - orderByCountryFinalQty;
      remainingGlovesGer =
        totalGloves - totalGlovesByCountry.quantity - orderByForeignCountryQty;
      glovesAmount = orderByCountryFinalQty * totalGlovesByCountry.price;
      if (passportCountry === "UK") {
        // maskAmount += productobc * 400;
      }
      if (passportCountry === "GERMANY") {
        glovesAmount += orderByForeignCountryQty * 400 * (20 / 100);
      }
    }
    if (country === "GERMANY") {
      remainingGlovesUK =
        ttotalGloves - totalGlovesByCountry.quantity - orderByForeignCountryQty;
      remainingGlovesGer =
        totalGlovesByCountry.quantity - orderByCountryFinalQty;
      glovesAmount = orderByCountryFinalQty * totalGlovesByCountry.price;
      if (passportCountry === "GERMANY") {
        // maskAmount += obc * 400;
      }
      if (passportCountry === "UK") {
        glovesAmount += orderByForeignCountryQty * 400 * (20 / 100);
      }
    }
  }
  // if order for gloves can not be full filled
  if (product2Qty > totalGloves || product1Qty > totalMask) {
    glovesAmount = 0;
    if (country === "UK") {
      remainingGlovesUK = totalGlovesByCountry.quantity;
      glovesAmount = 0;
      maskAmount = 0;
      remainingGlovesGer = totalGloves - totalGlovesByCountry.quantity;
      remainingMaskGer = totalMask - totalMaskByCountry.quantity;
      remainingMaskUK = totalMaskByCountry.quantity;
    }
    if (country === "GERMANY") {
      remainingGlovesUK = totalGloves - totalGlovesByCountry.quantity;
      glovesAmount = 0;
      maskAmount = 0;
      remainingGlovesGer = totalGlovesByCountry.quantity;
      remainingMaskUK = totalMask - totalMaskByCountry.quantity;
      remainingMaskGer = totalMaskByCountry.quantity;
    }
  }
  if (maskAmount == 0 || glovesAmount == 0) {
    console.info(
      "OUT_OF_STOCK",
      remainingMaskUK,
      remainingMaskGer,
      remainingGlovesUK,
      remainingGlovesGer
    );
  }
  if (maskAmount !== 0 || glovesAmount !== 0) {
    console.info(
      maskAmount + glovesAmount,
      remainingMaskUK,
      remainingMaskGer,
      remainingGlovesUK,
      remainingGlovesGer
    );
  }
};

module.exports = {
  addOrder,
};
