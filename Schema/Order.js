const program = require("commander");
// Require logic.js file and extract controller functions using JS destructuring assignment
const { addOrder } = require("./../Controller/OrderController");

program.version("0.0.1").description("Order Management System");

program
  .arguments("<country> [passport] <product> <quantity> <product2> <quantity2>")
  .command(
    "addOrder <country> [passport] <product> <quantity> <product2> <quantity2>"
  )
  .alias("AO")
  .description("Add a Order")
  .action((country, passport, product, quantity, product2, quantity2) => {
    addOrder({ country, passport, product, quantity, product2, quantity2 });
  });

program.parse(process.argv);
