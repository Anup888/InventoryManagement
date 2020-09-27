const { SHIPPING_DETAILS } = require("./Constants");
const countryByPassport = (passport) => {
  // console.info("passport", passport);
  const regexUK = /[B]{1}[0-9]{3}[A-Za-z]{2}[A-Za-z0-9]{7}/g;
  const regexGermany = /[A]{1}[A-Za-z]{2}[A-Za-z0-9]{9}/g;
  const foundUK = passport.match(regexUK);
  const foundGermany = passport.match(regexGermany);
  if (foundUK) {
    return "UK";
  }
  if (foundGermany) {
    return "GERMANY";
  }
  return null;
};
const calculateQuantity = (
  country,
  passportCountry,
  orderQuantity,
  UKquantity,
  Gerquantity
) => {
  let UKOrder = 0;
  let GerOrder = 0;
  let wholeNumber = 0;
  let extraNumber = 0;
  if (passportCountry) {
    if (passportCountry === "UK") {
      if (orderQuantity > UKquantity) {
        if (orderQuantity % 10 === 0) {
          UKOrder = UkQuantity;
          GerOrder = orderQuantity - UKquantity;
        }
        extraNumber = orderQuantity % 10;
        wholeNumber = orderQuantity - extraNumber;
        UKOrder = UKquantity;
        GerOrder = wholeNumber + extraNumber - UKquantity;
      }
      if (orderQuantity <= UKquantity) {
        if (orderQuantity % 10 === 0) {
          UKOrder = UKquantity;
          GerOrder = 0;
        }
        extraNumber = orderQuantity % 10;
        wholeNumber = orderQuantity - extraNumber;
        UKOrder = UKquantity - wholeNumber;
        GerOrder = Gerquantity - extraNumber;
      }
    }
    if (passportCountry !== "UK") {
      if (orderQuantity > Gerquantity) {
        if (orderQuantity % 10 === 0) {
          UKOrder = orderQuantity - Gerquantity;
          GerOrder = Gerquantity;
        }
        extraNumber = orderQuantity % 10;
        wholeNumber = orderQuantity - extraNumber;
        UKOrder = UkQuantity - extraNumber;
        GerOrder = wholeNumber + extraNumber - Gerquantity;
      }
      if (orderQuantity <= Gerquantity) {
        if (orderQuantity % 10 === 0) {
          UKOrder = 0;
          GerOrder = Gerquantity - orderQuantity;
        }
        extraNumber = orderQuantity % 10;
        wholeNumber = orderQuantity - extraNumber;
        UKOrder = UKquantity - extraNumber;
        GerOrder = Gerquantity - wholeNumber;
      }
    }
  }
  if (!passportCountry) {
    if (country === "UK") {
      if (orderQuantity > UKquantity) {
        UKOrder = UkQuantity;
        GerOrder = orderQuantity - UKquantity;
      }
      if (orderQuantity <= UKquantity) {
        UKOrder = UKquantity;
        GerOrder = 0;
      }
    }
    if (country !== "UK") {
      if (orderQuantity > UKquantity) {
        UKOrder = orderQuantity - UKquantity;
        GerOrder = Gerquantity;
      }
      if (orderQuantity <= UKquantity) {
        UKOrder = 0;
        GerOrder = Gerquantity;
      }
    }
  }
  return {
    UkQuantity: UKquantity - UKOrder,
    GerQuantity: Gerquantity - GerOrder,
  };
};
const transportCost = (
  country,
  passportCountry,
  product1Quantity,
  product2Quantity
) => {
  let sameCountry = country === passportCountry;
  let finalAmountP1 = 0;
  let finalAmountP2 = 0;
  if (!sameCountry) {
    // console.info("inside sameCountry", sameCountry, SHIPPING_DETAILS);
    if (product1Quantity > 10) {
      // let modulas = product1Quantity % SHIPPING_DETAILS.quantity;
      // product1Quantity = product1Quantity - mudulas;
      let numberOfshippingLots = product1Quantity / SHIPPING_DETAILS.quantity;
      finalAmountP1 +=
        SHIPPING_DETAILS.charges *
        numberOfshippingLots *
        (SHIPPING_DETAILS.discount / 100);
      // console.info("line 36", finalAmountP1);
    }
    if (product1Quantity <= 10) {
      // console.info("product1Quantity line40", product1Quantity);
      finalAmountP1 +=
        SHIPPING_DETAILS.charges * (SHIPPING_DETAILS.discount / 100);
      // console.info("line 41 transport cost", finalAmountP1);
    }
    if (product2Quantity > 10) {
      let numberOfshippingLots = product1Quantity / SHIPPING_DETAILS.quantity;
      finalAmountP1 +=
        (SHIPPING_DETAILS.charges *
          numberOfshippingLots *
          SHIPPING_DETAILS.discount) /
        100;
    }
    if (product2Quantity <= 10) {
      finalAmountP1 +=
        (SHIPPING_DETAILS.charges * SHIPPING_DETAILS.discount) / 100;
    }
  }

  return {
    product1Amount: finalAmountP1,
    product2Amount: finalAmountP2,
  };
};
const orderByCountryQty = (productQty, productAvailable, index = 0) => {
  // let index = index;
  if (productQty > productAvailable) {
    // console.info(productQty);
    index = index++;
    return orderByCountryQty(productQty - 10, productAvailable, index);
  } else {
    return { productQty, index };
  }
};

const orderByCountryQtyInlmt = (productQty, productAvailable, index = 0) => {
  let reminder = productQty % 10;
  let productQty1 = reminder;
  let productQty2 = productQty - reminder;
  return { productQty1, productQty2 };
};
module.exports = {
  countryByPassport,
  transportCost,
  calculateQuantity,
  orderByCountryQty,
  orderByCountryQtyInlmt,
};
