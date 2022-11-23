//Controller for items
import Item from "../model/schemas/Item.js";
import db from "../model/db.js";
import { generateItemCode } from "../utils/helper.js";
import { upload } from "../utils/multer.js";

const itemController = {
    // The dashboard or inventory page
    home: function (req, res) {
        res.render("index", {
            title: "index",
            styles: ["index.css", "w2ui-overrides.css", "./general/popup.css"],
            scripts: ["index.js"],
        });
    },

    // Redirects to home page
    homeRedirect: function (req, res) {
        res.redirect("/");
    },

    itemDetails: function (req, res) {
        res.render("item", {
            title: "Product",
            code: req.body.code,
            styles: ["item.css"],
            scripts: ["item.js"],
        });
    },

    // Adds item passed in a post request into the database
    addItem: async function (req, res) {
        console.log(">>FILE<<");
        console.log(req.file);
        console.log(">>BODY<<");
        console.log(req.body);

        var image = "test.png";

        if (req.file) {
            image = req.file;
            image = image.destination.replaceAll("./public/img/", "") + image.filename;
        }

        var addedItem = {
            image: image ?? "test.png",
            code: req.body.code,
            name: req.body.name,
            description: req.body.description,
            type: req.body.type,
            brand: req.body.brand,
            classification: req.body.classification,
            design: req.body.design,
            size: req.body.size,
            weight: req.body.weight,
            quantity: req.body.quantity,
            sellingType: req.body.sellingType,
            purchasePrice: req.body.purchasePrice,
            sellingPrice: req.body.sellingPrice,
            status: req.body.status,
            dateAdded: req.body.dateAdded,
            dateUpdated: req.body.dateUpdated,
            addedBy: req.session.user.username,
        };

        console.log(addedItem);

        db.insertOne(Item, addedItem, function (flag) {
            res.send(flag);
        });
    },
    getItems: function (req, res) {
        db.findMany(Item, {}, null, function (data) {
            res.status(200).json(data);
        });
    },

    getItem: function (req, res) {
        db.findOne(Item, {code:req.params.code}, {}, async function(data) {
            if (data){
                res.status(200).json(await data);
            }
            else {
                res.status(400).json({message: "Invalid Product Code.", fields: ["code"]});
            }
        });
    },

    restockItem: async function (req, res) {
        db.updateOne(Item, {code: req.body.code}, {$inc: {quantity: req.body.quantity}}, function (data) {
            res.send(data);
        });
    },

    sellItem: async function (req, res) {
        var error = "";        
        var quantity = req.body.quantity;
        var item = await Item.findOne({code: req.body.code});

        if (item.quantity == 0){
            error = "No available stock.";
        }
        else if ( (item.quantity - quantity) < 0) {
            error = "Insufficient stock.";
        }
        else {
            quantity = -Math.abs(req.body.quantity);
            db.updateOne(Item, {code: req.body.code}, {$inc: {quantity: quantity}}, function (data) {
                res.status(200).json(data);
            });
            return;
        }
        res.status(400).json({message: error, fields: ["quantity"]});
    },

    // //TO BE REMOVED:
    // addItemSamples: async function (data) {
    //     await Item.insertMany(data);
    // },
};

export default itemController;
