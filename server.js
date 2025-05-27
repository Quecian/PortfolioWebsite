'use strict';
var fs = require("fs");
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


const jwtKey = "my_secret_key"
const jwtExpirySeconds = 300


const mysql = require('mysql2');

const con = mysql.createConnection({
  host: "istwebclass.org",
  user: "dcampb20_user",
  password: "H00304107H00304107",
  database: "dcampb20_CapstoneProject",
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!!");
});

app.set("port", (process.env.PORT || 8080));

app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/backend/login.html"));
});

app.get('/cligetloggedout/', function (req, res) {
    res.cookie('token', 2, { maxAge: 0 })
    res.send({ redirect: '/index.html'});
});

app.get('/cligetloggedin/', function (req, res) {

    var viewthepage = 0;
    const validtoken = req.cookies.token
    console.log('token new:', validtoken);
    var payload;
    
    if(!validtoken) {
        viewthepage = 0;
        console.log("NVT");
    } else {
        try {
            payload = jwt.verify(validtoken, jwtKey);
            console.log('payload new:', payload.clikey);
            viewthepage = payload.clikey;
          } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                viewthepage = 0;
                console.log("NVT2");
            }
            viewthepage = 0;
            console.log("NVT3");
          }
    }
    
    console.log("View: " + viewthepage);
    
    return res.send(JSON.stringify(viewthepage));
    
});

app.get("/getclientinfo", function (req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Client not logged in." });
  }

  try {
    const payload = jwt.verify(token, jwtKey);
    const qc_clientid = payload.clikey; 
    
    const sql = "SELECT qc_clientfirstname FROM clients WHERE qc_clientid = ?";
    con.query(sql, [qc_clientid], function (err, results) {
      if (err) {
        console.error("Error fetching client info:", err);
        return res.status(500).json({ error: "Failed to get client info." });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Client not found." });
      }

      res.json({
        firstname: results[0].qc_clientfirstname,
        qc_clientid: qc_clientid,
      });
    });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
});

app.get('/usrgetloggedout/', function (req, res) {
  res.cookie('token', 2, { maxAge: 0 })
  res.send({ redirect: '/index.html'});
});

app.get('/usrgetloggedin', function (req, res) {
  var viewthepage = 0;
  const validtoken = req.cookies.token;
  console.log('token new:', validtoken);
  var payload;

  if (!validtoken) {
    viewthepage = 0;
    console.log("NVT");
  } else {
    try {
      payload = jwt.verify(validtoken, jwtKey);
      console.log('payload new:', payload);

      if (payload.roleid === 1 || payload.roleid === 2 || payload.roleid === 3) { // Only allow admin
        viewthepage = payload.roleid;
      } else {
        console.log("Unauthorized role");
        viewthepage = 0; // Deny access for non-emp roles
      }
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        viewthepage = 0;
        console.log("NVT2");
      }
      viewthepage = 0;
      console.log("NVT3");
    }
  }

  console.log("View: " + viewthepage);

  return res.send(JSON.stringify(viewthepage));
});

app.post("/loginuser", function (req, res) {
  var uemail = req.body.qc_useremail;
  var upw = req.body.qc_userpw;

  var sqlsel = "SELECT * FROM users WHERE qc_useremail = ?";
  var inserts = [uemail];
  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error("Database query failed:", err);
      return res.status(500).send({ message: "Internal server error" });
    }

    if (data && data.length > 0) {
      console.log("User found:");
      var usrkey = data[0].qc_userid;
      console.log(usrkey);

      bcrypt.compare(upw, data[0].qc_userpassword, function (err, passwordCorrect) {
        if (err) {
          console.error("Bcrypt error:", err);
          return res.status(500).send({ message: "Internal server error" });
        }

        if (!passwordCorrect) {
          console.log("Password Incorrect");
          return res.status(401).send({ message: "Incorrect password" });
        }

        console.log("Password Correct");
        const usrkey = data[0].qc_userid;
        const roleid = data[0].qc_userroleid; // Get the role ID from the database
        
        const token = jwt.sign({ usrkey, roleid }, jwtKey, {
          algorithm: "HS256",
          expiresIn: jwtExpirySeconds,
        });
        
        res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000, httpOnly: true });
        res.send({ redirect: "index.html" });
      });

    } else {
      console.log("Incorrect username or password");
      return res.status(401).send({ message: "User not found" });
    }
  });
});

app.get('/getloggedin/', function (req, res) {

    var viewpage = 0;
    const validtoken = req.cookies.token
    console.log('token new:', validtoken);
    var payload;
    
    if(!validtoken) {
        viewpage = 0;
        console.log("NVT");
    } else {
        try {
            payload = jwt.verify(validtoken, jwtKey);
            console.log('payload new:', payload.roleid);
            viewpage = payload.roleid;
          } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) {
                viewpage = 0;
                console.log("NVT2");
            }
            viewpage = 0;
            console.log("NVT3");
          }
    }
    
    console.log("View: " + viewpage);
    
    return res.send(JSON.stringify(viewpage));
    
});

app.post('/clientlogin', function (req, res) {
  var cemail = req.body.qc_clientemail;
  var cpw = req.body.qc_clientpw;

  var sqlsel = 'SELECT * FROM clients WHERE qc_clientemail = ?';
  var inserts = [cemail];
  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
      if (err) {
          console.error("Database query failed:", err);
          return res.status(500).send({ message: "Internal server error" });
      }

      if (data && data.length > 0) {
          console.log("User name correct:");
          var clikey = data[0].qc_clientid;
          console.log(clikey);

          bcrypt.compare(cpw, data[0].qc_clientpassword, function (err, passwordCorrect) {
              if (err) {
                  console.error("Bcrypt error:", err);
                  return res.status(500).send({ message: "Internal server error" });
              }

              if (!passwordCorrect) {
                  console.log("Password Incorrect");
                  return res.status(401).send({ message: "Incorrect password" });
              }

              console.log("Password Correct");
              const token = jwt.sign({ clikey }, jwtKey, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds
              });
              

              res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000, httpOnly: true });
              res.send({ redirect: 'bookappt.html' });
          });

      } else {
          console.log("Incorrect user name or password!!");
          return res.status(401).send({ message: "User not found" });
      }
  });
});





// Insert Endpoints
app.post("/user", function (req, res) {
  var qc_username = req.body.qc_username;
  var qc_useremail = req.body.qc_useremail;
  var qc_userpassword = req.body.qc_userpassword;
  var qc_userfirstname = req.body.qc_userfirstname;
  var qc_userlastname = req.body.qc_userlastname;
  var qc_userpreferredname = req.body.qc_userpreferredname;
  var qc_userphone = req.body.qc_userphone;
  var qc_useraddress = req.body.qc_useraddress;
  var qc_userzip = req.body.qc_userzip;
  var qc_userstartdate = req.body.qc_userstartdate;
  var qc_userenddate = req.body.qc_userenddate;
  var qc_userroleid = req.body.qc_userroleid;

  // Hash the password before storing it
  bcrypt.hash(qc_userpassword, 10, function (err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).send("Error saving user");
    }

    var sqlins =
      "INSERT INTO `users` " +
      "(`qc_username`, `qc_useremail`, `qc_userpassword`, `qc_userfirstname`, `qc_userlastname`, `qc_userpreferredname`, `qc_userphone`, `qc_useraddress`, `qc_userzip`, `qc_userstartdate`, `qc_userenddate`, `qc_userroleid`) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    var inserts = [
      qc_username,
      qc_useremail,
      hash,
      qc_userfirstname,
      qc_userlastname,
      qc_userpreferredname,
      qc_userphone,
      qc_useraddress,
      qc_userzip,
      qc_userstartdate,
      qc_userenddate,
      qc_userroleid,
    ];

    con.execute(sqlins, inserts, function (err, result) {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).send("Error saving user");
      }
      console.log("User inserted successfully.");
      res.redirect("/insertuser.html");
    });
  });
});

app.post("/service", function (req, res) {
  var sname = req.body.qc_servicename;
  var slength = req.body.qc_servicelength;
  var stype = req.body.qc_servicetype;
  var snote = req.body.qc_servicenote;
  var scost = req.body.qc_servicecost;

  var sqlins =
    "INSERT INTO `services` (`qc_servicename`, `qc_servicelength`, `qc_servicetype`, `qc_servicenotes`, `qc_servicecost`) VALUES (?, ?, ?, ?, ?)";
  var inserts = [sname, slength, stype, snote, scost];

  con.execute(sqlins, inserts, function (err, result) {
    if (err) {
      console.error("Error inserting service:", err);
      return res.status(500).send("Error saving service");
    }
    console.log("Service inserted successfully.");
    res.redirect("/backend/insertservice.html"); // Ensure you have this HTML file
  });
});

app.post("/sales", function (req, res) {
  var qc_saleclientname = req.body.qc_saleclientname;
  var qc_saleclientid = req.body.qc_saleclientid;
  var qc_saleuserid = req.body.qc_saleuserid;
  var qc_salesubtotal = parseFloat(req.body.qc_salesubtotal);
  var qc_saletax = parseFloat((qc_salesubtotal * 0.15).toFixed(2));
  var qc_saletotal = parseFloat((qc_salesubtotal + qc_saletax).toFixed(2));
  var qc_saledate = req.body.qc_saledate;
  var qc_salequantity = req.body.qc_salequantity;
  var qc_productid = req.body.qc_productid;

  if (!qc_saledate) {
    console.error("Sales date is required.");
    return res.status(400).send("Sales date is required.");
  }

  var sqlins =
    "INSERT INTO `sales` (`qc_saleclientname`, `qc_saleclientid`, `qc_salesubtotal`, `qc_saletax`, `qc_saletotal`, `qc_saleuserid`, `qc_saledate`, `qc_salequantity`, `qc_productid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  var inserts = [
    qc_saleclientname,
    qc_saleclientid,
    qc_salesubtotal,
    qc_saletax,
    qc_saletotal,
    qc_saleuserid,
    qc_saledate,
    qc_salequantity,
    qc_productid,
  ];

  con.execute(sqlins, inserts, function (err, result) {
    if (err) {
      console.error("Error inserting sale:", err);
      return res.status(500).send("Error saving sale");
    }

    // Decrease product quantity
    var sqlUpdateQty =
      "UPDATE `product` SET `qc_productQuantity` = `qc_productQuantity` - ? WHERE `qc_productid` = ? AND `qc_productQuantity` >= ?";
    con.execute(
      sqlUpdateQty,
      [qc_salequantity, qc_productid, qc_salequantity],
      function (err2, result2) {
        if (err2) {
          console.error("Error updating product quantity:", err2);
          return res.status(500).send("Error updating product inventory");
        }

        console.log("Sale inserted and product quantity updated.");
        res.redirect("/insertsale.html");
      }
    );
  });
});

app.post("/role", function (req, res) {
  // Extract form data from the request body
  var qc_rolename = req.body.qc_rolename;
  var qc_roletype = req.body.qc_roletype;
  var qc_rolepermissions = req.body.qc_rolepermissions;

  // Ensure all required fields are provided
  if (!qc_rolename || !qc_roletype || !qc_rolepermissions) {
    console.error("Missing required fields.");
    return res.status(400).send("All fields are required.");
  }

  // SQL query to insert data into the `role` table
  var sqlins =
    "INSERT INTO `role` (`qc_rolename`, `qc_roletype`, `qc_rolepermissions`) VALUES (?, ?, ?)";
  var inserts = [qc_rolename, qc_roletype, qc_rolepermissions];

  // Execute the SQL query
  con.execute(sqlins, inserts, function (err, result) {
    if (err) {
      console.error("Error inserting role:", err);
      return res.status(500).send("Error saving role");
    }
    console.log("Role inserted successfully.");
    res.redirect("/insertrole.html"); // Ensure this file exists
  });
});

app.post("/product", function (req, res) {
  var pname = req.body.qc_productName;
  var pdescription = req.body.qc_productDescription;
  var psku = req.body.qc_productSKU;
  var pquantity = req.body.qc_productQuantity;
  var pprice = req.body.qc_productPrice;
  var pcost = req.body.qc_productCost;

  var sqlins =
    "INSERT INTO `product` (`qc_productname`, `qc_productdesc`, `qc_productsku`, `qc_productquantity`, `qc_productprice`, `qc_productcost`) VALUES (?, ?, ?, ?, ?, ?)";
  var inserts = [pname, pdescription, psku, pquantity, pprice, pcost];

  con.execute(sqlins, inserts, function (err, result) {
    if (err) throw err;

    console.log("Product inserted successfully.");
    res.redirect("/insertproduct.html");
  });
});

app.post("/booked", function (req, res) {
  // Extract data from the request body
  var qc_clientid = req.body.qc_clientid; // Required field
  var qc_userid = req.body.qc_userid; // Required field
  var qc_appointmentdate = req.body.qc_appointmentdate; // Required field
  var qc_appointmenttime = req.body.qc_appointmenttime; // Required field
  var qc_servicename = req.body.qc_servicename; // Required field
  var qc_servicetype = req.body.qc_servicetype; // Required field
  var qc_saletotal = req.body.qc_saletotal; // Required field
  var qc_notes = req.body.qc_notes; // Optional field

  // Log the incoming data to verify it
  console.log("Received Booking Data:");
  console.log("Client ID:", qc_clientid);
  console.log("User ID:", qc_userid);
  console.log("Appointment Date:", qc_appointmentdate);
  console.log("Appointment Time:", qc_appointmenttime);
  console.log("Service Name:", qc_servicename);
  console.log("Service Type:", qc_servicetype);
  console.log("Sale Total:", qc_saletotal);
  console.log("qc_notes:", qc_notes);

  // Validate required fields
  if (
    !qc_clientid ||
    !qc_userid ||
    !qc_appointmentdate ||
    !qc_appointmenttime ||
    !qc_servicename ||
    !qc_servicetype ||
    !qc_saletotal
  ) {
    console.error("Validation Error: All required fields must be provided.");
    return res.status(400).send("All required fields must be provided.");
  }

  // SQL query to insert data into the `bookings` table
  var sqlins = `
    INSERT INTO bookings (
      qc_clientid, 
      qc_userid, 
      qc_appointmentdate, 
      qc_appointmenttime, 
      qc_servicename, 
      qc_servicetype, 
      qc_saletotal, 
      qc_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  var inserts = [
    qc_clientid,
    qc_userid,
    qc_appointmentdate,
    qc_appointmenttime,
    qc_servicename,
    qc_servicetype,
    qc_saletotal,
    qc_notes,
  ];

  // Log the SQL query and its inserts before executing
  console.log("Prepared SQL Query:");
  console.log(sqlins);
  console.log("Query Values:");
  console.log(inserts);

  // Execute the query
  con.execute(sqlins, inserts, function (err, result) {
    if (err) {
      console.error("Error Inserting Booking:", err);
      return res.status(500).send("Error saving booking record.");
    }
    console.log("Booking Record Inserted Successfully. Result:");
    console.log(result);
    res.json({ message: "Booking created successfully", result: result }); // Send a JSON response
  });
});

app.post("/client", function (req, res) {
  var qc_clientlastname = req.body.qc_clientlastname;
  var qc_clientfirstname = req.body.qc_clientfirstname;
  var qc_clientphone = req.body.qc_clientphone;
  var qc_clientemail = req.body.qc_clientemail;
  var qc_clientaddress = req.body.qc_clientaddress;
  var qc_clientzip = req.body.qc_clientzip;
  var qc_clientpassword = req.body.qc_clientpassword;

  // Hash the password before storing it
  bcrypt.hash(qc_clientpassword, 10, function (err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).send("Error saving client");
    }

    var sqlins =
      "INSERT INTO `clients` " +
      "(`qc_clientlastname`, `qc_clientfirstname`, `qc_clientphone`, `qc_clientemail`, `qc_clientaddress`, `qc_clientzip`, `qc_clientpassword`) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?)";

    var inserts = [
      qc_clientlastname,
      qc_clientfirstname,
      qc_clientphone,
      qc_clientemail,
      qc_clientaddress,
      qc_clientzip,
      hash,
    ];

    con.execute(sqlins, inserts, function (err, result) {
      if (err) {
        console.error("Error inserting client:", err);
        return res.status(500).send("Error saving client");
      }
      console.log("Client inserted successfully.");
      res.redirect("/insertclient.html");
    });
  });
});

app.post("/appointment", function (req, res) {
  // Extract data from the request body
  var qc_apptdate = req.body.qc_apptdate; // Required field
  var qc_appttime = req.body.qc_appttime; // Required field
  var qc_apptlength = parseFloat(req.body.qc_apptlength); // Required field
  var qc_apptuserid = req.body.qc_apptuserid || null; // Nullable field
  var qc_apptclientid = req.body.qc_apptclientid || null; // Nullable field
  var qc_apptserviceid = req.body.qc_apptserviceid || null; // Nullable field

  // Log the incoming data to verify it
  console.log("Received Appointment Data:");
  console.log("Appointment Date:", qc_apptdate);
  console.log("Appointment Time:", qc_appttime);
  console.log("Appointment Length:", qc_apptlength);
  console.log("User ID:", qc_apptuserid);
  console.log("Client ID:", qc_apptclientid);
  console.log("Service ID:", qc_apptserviceid);

  // Validate required fields
  if (!qc_apptdate || !qc_appttime || isNaN(qc_apptlength)) {
    console.error(
      "Validation Error: Appointment Date, Time, and Length are required."
    );
    return res
      .status(400)
      .send("Appointment Date, Time, and Length are required.");
  }

  // SQL query to insert data into the `appointments` table
  var sqlins = `
      INSERT INTO appointments (
          qc_apptdate, 
          qc_appttime, 
          qc_apptlength, 
          qc_apptuserid, 
          qc_apptclientid, 
          qc_apptserviceid
      ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  var inserts = [
    qc_apptdate,
    qc_appttime,
    qc_apptlength,
    qc_apptuserid,
    qc_apptclientid,
    qc_apptserviceid,
  ];

  // Log the SQL query and its inserts before executing
  console.log("Prepared SQL Query:");
  console.log(sqlins);
  console.log("Query Values:");
  console.log(inserts);

  // Execute the query
  con.execute(sqlins, inserts, function (err, result) {
    if (err) {
      console.error("Error Inserting Appointment:", err);
      return res.status(500).send("Error saving appointment.");
    }
    console.log("Appointment Record Inserted Successfully. Result:");
    console.log(result);
    res.redirect("insertappointment.html"); // Ensure this file exists
  });
});

app.post("/bookings", function (req, res) {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var phone = req.body.phone;
  var selectedServices = req.body.selectedServices;
  var qc_date = req.body.qc_date;
  var qc_time = req.body.qc_time;
  var qc_notes = req.body.qc_notes;
  var password = req.body.password;

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: "Password is required and must be at least 6 characters long.",
    });
  }

  var totalServiceLength = 0;
  var subtotal = 0;
  var serviceDetails = [];

  var getServicesQuery =
    "SELECT `qc_serviceid`, `qc_servicename`, `qc_servicelength`, `qc_servicecost` FROM `services` WHERE `qc_servicename` IN (?)";

  con.query(
    getServicesQuery,
    [selectedServices],
    function (err, servicesResults) {
      if (err) {
        console.error("Error fetching service details:", err);
        return res
          .status(500)
          .json({ error: "Failed to retrieve service information." });
      }

      if (servicesResults.length !== selectedServices.length) {
        return res
          .status(400)
          .json({ error: "One or more selected services not found." });
      }

      servicesResults.forEach(function (service) {
        totalServiceLength += parseFloat(service.qc_servicelength);
        subtotal += parseFloat(service.qc_servicecost);
        serviceDetails.push(service);
      });

      bcrypt.hash(password, 10, function (hashErr, hash) {
        if (hashErr) {
          console.error("Error hashing password:", hashErr);
          return res
            .status(500)
            .json({ error: "Error saving client password." });
        }

        var sqlClients =
          "INSERT INTO `clients` (`qc_clientlastname`, `qc_clientfirstname`, `qc_clientphone`, `qc_clientemail`, `clientpassword`) VALUES (?, ?, ?, ?, ?)";
        var clientInserts = [lname, fname, phone, email, hash];

        con.execute(
          sqlClients,
          clientInserts,
          function (clientErr, clientResult) {
            if (clientErr) {
              console.error("Error inserting client:", clientErr);
              return res
                .status(500)
                .json({ error: "Failed to create client record." });
            }

            var qc_clientid = clientResult.insertId;
            console.log("Client inserted successfully with ID:", qc_clientid);

            var appointmentInserts = [
              null,
              qc_date,
              qc_time,
              totalServiceLength,
              qc_notes,
              null,
              qc_clientid,
              null,
            ];

            var sqlAppointments =
              "INSERT INTO `appointments` (`qc_apptid`, `qc_apptdate`, `qc_appttime`, `qc_apptlength`, `qc_apptnotes`, `qc_apptuserid`, `qc_apptclientid`, `qc_apptserviceid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

            con.execute(
              sqlAppointments,
              appointmentInserts,
              function (appointmentsErr, appointmentsResult) {
                if (appointmentsErr) {
                  console.error(
                    "Error inserting appointment:",
                    appointmentsErr
                  );
                  return res
                    .status(500)
                    .json({ error: "Failed to create appointment record." });
                }

                var salesTax = subtotal * 0.15;
                var qc_saletotal = subtotal + salesTax;

                var sqlSales =
                  "INSERT INTO `sales` (`qc_productid`, `qc_salequantity`, `qc_salesubtotal`, `qc_saletax`, `qc_saletotal`, `qc_saleclientname`, `qc_saleclientid`, `qc_saleuserid`, `qc_saledate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

                var salesInserts = [
                  null,
                  selectedServices.length,
                  subtotal,
                  salesTax,
                  qc_saletotal,
                  fname + " " + lname,
                  qc_clientid,
                  null,
                  qc_date,
                ];

                con.execute(
                  sqlSales,
                  salesInserts,
                  function (salesErr, salesResult) {
                    if (salesErr) {
                      console.error("Error inserting sale:", salesErr);
                      return res
                        .status(500)
                        .json({ error: "Failed to create sales record." });
                    }

                    res.status(201).json({
                      message: "Booking created successfully.",
                      qc_clientid: qc_clientid,
                      appointmentId: appointmentsResult.insertId,
                      qc_saleid: salesResult.insertId,
                      subtotal: subtotal,
                      tax: salesTax,
                      total: qc_saletotal,
                      totalLength: totalServiceLength,
                      quantity: selectedServices.length,
                    });
                  }
                );
              }
            );
          }
        );
      });
    }
  );
});

app.post("/bookappt", function (req, res) {
  console.log("Request Body Received:", req.body);
  const { qc_clientid, qc_userid, selectedServices, qc_date, qc_time, qc_notes } = req.body; // ✅ Extract from body

  if (
    !qc_clientid ||
    !qc_userid ||
    !selectedServices ||
    !selectedServices.length ||
    !qc_date ||
    !qc_time
  ) {
    console.error("Missing or Invalid Fields:", {
      qc_clientid,
      qc_userid,
      selectedServices,
      qc_date,
      qc_time,
    });
    return res.status(400).json({ error: "Missing required booking fields." });
  }

  let totalServiceLength = 0;
  let subtotal = 0;
  let serviceDetails = [];

  const getServicesQuery =
    "SELECT `qc_servicename`, `qc_servicetype`, `qc_servicelength`, `qc_servicecost` FROM `services` WHERE `qc_servicename` IN (?)";

  con.query(
    getServicesQuery,
    [selectedServices],
    function (err, servicesResults) {
      if (err) {
        console.error("Error fetching services:", err);
        return res
          .status(500)
          .json({ error: "Failed to retrieve service info." });
      }

      if (servicesResults.length !== selectedServices.length) {
        return res
          .status(400)
          .json({ error: "One or more services not found." });
      }

      servicesResults.forEach((service) => {
        totalServiceLength += parseFloat(service.qc_servicelength);
        subtotal += parseFloat(service.qc_servicecost);
        serviceDetails.push(service);
      });

      const salesTax = subtotal * 0.15;
      const qc_saletotal = subtotal + salesTax;

      const appointmentInserts = [
        null,
        qc_date,
        qc_time,
        totalServiceLength,
        qc_notes || null,
        qc_userid,
        qc_clientid,
        null,
      ];

      const sqlAppointments =
        "INSERT INTO `appointments` (`qc_apptid`, `qc_apptdate`, `qc_appttime`, `qc_apptlength`, `qc_apptnotes`, `qc_apptuserid`, `qc_apptclientid`, `qc_apptserviceid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

      con.execute(
        sqlAppointments,
        appointmentInserts,
        function (appointmentsErr, appointmentsResult) {
          if (appointmentsErr) {
            console.error("Error inserting appointment:", appointmentsErr);
            return res
              .status(500)
              .json({ error: "Failed to create appointment record." });
          }

          const salesInserts = [
            null,
            null,
            selectedServices.length,
            subtotal,
            salesTax,
            qc_saletotal,
            qc_clientid,
            qc_clientid,
            qc_userid,
            qc_date,
          ];

          const sqlSales =
            "INSERT INTO `sales` (`qc_salesid`, `qc_productid`, `qc_salequantity`, `qc_salesubtotal`, `qc_saletax`, `qc_saletotal`, `qc_saleclientname`, `qc_saleclientid`, `qc_saleuserid`, `qc_saledate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

          con.execute(sqlSales, salesInserts, function (salesErr, salesResult) {
            if (salesErr) {
              console.error("Error inserting sale:", salesErr);
              return res
                .status(500)
                .json({ error: "Failed to create sales record." });
            }

            const primaryService = serviceDetails[0];

            const bookingsInserts = [
              null,
              qc_clientid,
              qc_userid,
              qc_date,
              qc_time,
              primaryService.qc_servicename,
              primaryService.qc_servicetype,
              qc_saletotal,
              qc_notes || null,
            ];

            const sqlBookings =
              "INSERT INTO `bookings` (`qc_bookingid`, `qc_clientid`, `qc_userid`, `qc_appointmentdate`, `qc_appointmenttime`, `qc_servicename`, `qc_servicetype`, `qc_saletotal`, `qc_notes`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            con.execute(
              sqlBookings,
              bookingsInserts,
              function (bookingErr, bookingResult) {
                if (bookingErr) {
                  console.error("Error inserting booking:", bookingErr);
                  return res
                    .status(500)
                    .json({ error: "Failed to create booking record." });
                }

                res.status(201).json({
                  message: "Booking created successfully.",
                  qc_bookingid: bookingResult.insertId,
                  appointmentId: appointmentsResult.insertId,
                  qc_saleid: salesResult.insertId,
                  qc_saletotal: qc_saletotal,
                  totalLength: totalServiceLength,
                  quantity: selectedServices.length,
                });
              }
            );
          });
        }
      );
    }
  );
});

//Retrieval Endpoints

app.get("/getroletypes", function (req, res) {
  var sqlsel = "select * from role";
  var sql = mysql.format(sqlsel);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getusertypes", function (req, res) {
  var sqlsel = "select * from users";
  var sql = mysql.format(sqlsel);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getproducts", function (req, res) {
  var sqlsel = "select * from product";
  var sql = mysql.format(sqlsel);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getclienttypes", function (req, res) {
  var sqlsel = "select * from clients";
  var sql = mysql.format(sqlsel);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getservicetypes", function (req, res) {
  var sqlsel = "select * from services";
  var sql = mysql.format(sqlsel);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getservices", function (req, res) {
  var sqlsel = "SELECT * FROM services";
  var sql = mysql.format(sqlsel);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving services");
      return;
    }

    res.json(data);
  });
});

app.get("/getappointments", function (req, res) {
  var qc_apptdate = req.query.qc_apptdate;
  var qc_appttime = req.query.qc_appttime;
  var qc_apptlength = req.query.qc_apptlength;
  var qc_apptuserid = req.query.qc_apptuserid;
  var qc_apptclientid = req.query.qc_apptclientid;
  var qc_apptserviceid = req.query.qc_apptserviceid;

  var sqlsel =
    "SELECT * FROM appointments WHERE qc_apptdate LIKE ? AND qc_appttime LIKE ? AND qc_apptlength LIKE ? AND qc_apptuserid LIKE ? AND qc_apptclientid LIKE ? AND qc_apptserviceid LIKE ?";

  var inserts = [
    "%" + qc_apptdate + "%",
    "%" + qc_appttime + "%",
    "%" + qc_apptlength + "%",
    "%" + qc_apptuserid + "%",
    "%" + qc_apptclientid + "%",
    "%" + qc_apptserviceid + "%",
  ];

  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(data);
  });
});

app.get("/getclients", function (req, res) {
  var qc_clientfirstname = req.query.qc_clientfirstname;
  var qc_clientlastname = req.query.qc_clientlastname;
  var qc_clientphone = req.query.qc_clientphone;
  var qc_clientemail = req.query.qc_clientemail;
  var qc_clientaddress = req.query.qc_clientaddress;
  var qc_clientzip = req.query.qc_clientzip;
  var sqlsel =
    "SELECT * FROM clients WHERE qc_clientfirstname LIKE ? AND qc_clientlastname LIKE ? AND qc_clientphone LIKE ? AND qc_clientemail LIKE ? AND qc_clientaddress LIKE ? AND qc_clientzip LIKE ?";

  var inserts = [
    "%" + qc_clientfirstname + "%",
    "%" + qc_clientlastname + "%",
    "%" + qc_clientphone + "%",
    "%" + qc_clientemail + "%",
    "%" + qc_clientaddress + "%",
    "%" + qc_clientzip + "%",
  ];

  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(data);
  });
});

app.get("/getbookings", function (req, res) {
  var qc_bookingid = req.query.qc_bookingid;
  var qc_clientid = req.query.qc_clientid;
  var qc_userid = req.query.qc_userid;
  var qc_appointmentdate = req.query.qc_appointmentdate;
  var qc_appointmenttime = req.query.qc_appointmenttime;
  var qc_servicename = req.query.qc_servicename;
  var qc_servicetype = req.query.qc_servicetype;
  var qc_saletotal = req.query.qc_saletotal;

  // Define the SQL query with placeholders for the search criteria
  var sqlsel =
    "SELECT * FROM bookings WHERE qc_bookingid LIKE ? AND qc_clientid LIKE ? AND qc_userid LIKE ? AND qc_appointmentdate LIKE ? AND qc_appointmenttime LIKE ? AND qc_servicename LIKE ? AND qc_servicetype LIKE ? AND qc_saletotal LIKE ?";

  // Build the array of values to insert into the query
  var inserts = [
    "%" + qc_bookingid + "%",
    "%" + qc_clientid + "%",
    "%" + qc_userid + "%",
    "%" + qc_appointmentdate + "%",
    "%" + qc_appointmenttime + "%",
    "%" + qc_servicename + "%",
    "%" + qc_servicetype + "%",
    "%" + qc_saletotal + "%",
  ];

  // Format the SQL query with the inserted values
  var sql = mysql.format(sqlsel, inserts);

  // Log the query for debugging purposes
  console.log(sql);

  // Execute the query and handle the result
  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // Send the data as a JSON response
    res.json(data);
  });
});

app.get("/getproduct", function (req, res) {
  var qc_productName = req.query.qc_productName;
  var qc_productDescription = req.query.qc_productDescription;
  var qc_productSKU = req.query.qc_productSKU;
  var qc_productQuantity = req.query.qc_productQuantity;
  var qc_productPrice = req.query.qc_productPrice;
  var qc_productCost = req.query.qc_productCost;

  var sqlsel =
    "SELECT * FROM product WHERE qc_productname LIKE ? AND qc_productdesc LIKE ? AND qc_productsku LIKE ? AND qc_productquantity LIKE ? AND qc_productprice LIKE ? AND qc_productcost LIKE ?";

  var inserts = [
    "%" + qc_productName + "%",
    "%" + qc_productDescription + "%",
    "%" + qc_productSKU + "%",
    "%" + qc_productQuantity + "%",
    "%" + qc_productPrice + "%",
    "%" + qc_productCost + "%",
  ];

  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching products" });
      return;
    }
    res.json(data);
  });
});

app.get("/getproductprice", function (req, res) {
  var qc_productid = req.query.qc_productid;

  if (!qc_productid) {
    return res.status(400).send("Product ID is required.");
  }

  var sql =
    "SELECT qc_productprice, qc_productquantity FROM products WHERE qc_productid = ?";
  con.execute(sql, [qc_productid], function (err, results) {
    if (err) {
      console.error("Error retrieving product info:", err);
      return res.status(500).send("Error retrieving product info");
    }

    if (results.length === 0) {
      return res.status(404).send("Product not found.");
    }

    res.json(results[0]);
  });
});

app.get("/getroles", function (req, res) {
  var qc_rolename = req.query.qc_rolename;
  var qc_roletype = req.query.qc_roletype;
  var qc_rolepermissions = req.query.qc_rolepermissions;

  var sqlsel =
    "SELECT * FROM role WHERE qc_rolename LIKE ? AND qc_roletype LIKE ? AND qc_rolepermissions LIKE ?";

  var inserts = [
    "%" + qc_rolename + "%",
    "%" + qc_roletype + "%",
    "%" + qc_rolepermissions + "%",
  ];

  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching roles" });
      return;
    }
    res.json(data);
  });
});

app.get("/getsales", function (req, res) {
  var qc_productid = req.query.qc_productid;
  var qc_salequantity = req.query.qc_salequantity;
  var qc_salesubtotal = req.query.qc_salesubtotal;
  var qc_saletax = req.query.qc_saletax;
  var qc_saletotal = req.query.qc_saletotal;
  var qc_saleclientname = req.query.qc_saleclientname;
  var qc_saleclientid = req.query.qc_saleclientid;
  var qc_saleuserid = req.query.qc_saleuserid;
  var qc_saledate = req.query.qc_saledate;

  var sqlsel = `
    SELECT * FROM sales 
    WHERE qc_productid LIKE ? 
      AND qc_salequantity LIKE ? 
      AND qc_salesubtotal LIKE ? 
      AND qc_saletax LIKE ? 
      AND qc_saletotal LIKE ? 
      AND qc_saleclientname LIKE ? 
      AND qc_saleclientid LIKE ? 
      AND qc_saleuserid LIKE ? 
      AND qc_saledate LIKE ?`;

  var inserts = [
    "%" + qc_productid + "%",
    "%" + qc_salequantity + "%",
    "%" + qc_salesubtotal + "%",
    "%" + qc_saletax + "%",
    "%" + qc_saletotal + "%",
    "%" + qc_saleclientname + "%",
    "%" + qc_saleclientid + "%",
    "%" + qc_saleuserid + "%",
    "%" + qc_saledate + "%",
  ];

  var sql = mysql.format(sqlsel, inserts);

  console.log("Executing SQL:", sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error("Error fetching sales:", err);
      return res.status(500).json({ error: "Error fetching sales" });
    }
    res.json(data);
  });
});

app.get("/getservice", function (req, res) {
  var qc_servicename = req.query.qc_servicename;
  var qc_servicelength = req.query.qc_servicelength;
  var qc_servicetype = req.query.qc_servicetype;
  var qc_servicenotes = req.query.qc_servicenote;
  var qc_servicecost = req.query.qc_servicecost;

  var sqlsel =
    "SELECT * FROM services WHERE qc_servicename LIKE ? AND qc_servicelength LIKE ? AND qc_servicetype LIKE ? AND qc_servicenotes LIKE ? AND qc_servicecost LIKE ?";

  var inserts = [
    "%" + qc_servicename + "%",
    "%" + qc_servicelength + "%",
    "%" + qc_servicetype + "%",
    "%" + qc_servicenotes + "%",
    "%" + qc_servicecost + "%",
  ];

  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching services" });
      return;
    }
    res.json(data);
  });
});

app.get("/getusers", function (req, res) {
  console.log("Query params:", req.query);

  var qc_username = req.query.qc_username;
  var qc_useremail = req.query.qc_useremail;
  var qc_userfirstname = req.query.qc_userfirstname;
  var qc_userlastname = req.query.qc_userlastname;
  var qc_userpreferredname = req.query.qc_userpreferredname;
  var qc_userphone = req.query.qc_userphone;
  var qc_useraddress = req.query.qc_useraddress;
  var qc_userzip = req.query.qc_userzip;
  var qc_userstartdate = req.query.qc_userstartdate;
  var qc_userroleid = req.query.qc_userroleid;
  var qc_userenddate = req.query.qc_userenddate;
  var sqlsel =
    "SELECT * FROM users WHERE qc_username LIKE ? AND qc_useremail LIKE ? AND qc_userfirstname LIKE ? AND qc_userlastname LIKE ? AND qc_userpreferredname LIKE ? AND qc_userphone LIKE ? AND qc_useraddress LIKE ? AND qc_userzip LIKE ? AND qc_userstartdate LIKE ? AND qc_userroleid LIKE ? AND qc_userenddate LIKE ?";

  var inserts = [
    "%" + qc_username + "%",
    "%" + qc_useremail + "%",
    "%" + qc_userfirstname + "%",
    "%" + qc_userlastname + "%",
    "%" + qc_userpreferredname + "%",
    "%" + qc_userphone + "%",
    "%" + qc_useraddress + "%",
    "%" + qc_userzip + "%",
    "%" + qc_userstartdate + "%",
    "%" + qc_userroleid + "%",
    "%" + qc_userenddate + "%",
  ];

  var sql = mysql.format(sqlsel, inserts);

  console.log(sql);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching users" });
      return;
    }
    res.json(data);
  });
});

app.get("/getLoggedInUser", function (req, res) {
  // Check if the user is logged in and the session exists
  if (req.session && req.session.user) {
    const user = req.session.user;

    // Respond with the logged-in user's data
    res.status(200).json({
      qc_clientid: user.qc_clientid,
      qc_clientfirstname: user.qc_clientfirstname,
    });
  } else {
    // Handle case where user is not logged in
    res.status(401).json({ error: "User not logged in or session expired." });
  }
});

// Single Data Endpoints

app.get("/getsingleappt/", function (req, res) {
  var akey = req.query.qc_upapptid;

  var sqlsel = "select * from appointments where qc_apptid = ?";
  var inserts = [akey];

  var sql = mysql.format(sqlsel, inserts);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getsingleclient/", function (req, res) {
  var ckey = req.query.qc_upclientkey;

  var sqlsel = "select * from clients where qc_clientid = ?";
  var inserts = [ckey];

  var sql = mysql.format(sqlsel, inserts);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});
app.get("/getsingleservice/", function (req, res) {
  var skey = req.query.qc_upservicekey;

  var sqlsel = "select * from services where qc_serviceid = ?";
  var inserts = [skey];

  var sql = mysql.format(sqlsel, inserts);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getsingleuser/", function (req, res) {
  var ukey = req.query.qc_upuserkey;

  var sqlsel = "select * from users where qc_userid = ?";
  var inserts = [ukey];

  var sql = mysql.format(sqlsel, inserts);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getsinglesale/", function (req, res) {
  var skey = req.query.qc_upsalekey;

  var sqlsel = "select * from sales where qc_salesid = ?";
  var inserts = [skey];

  var sql = mysql.format(sqlsel, inserts);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

app.get("/getsinglebooking", function (req, res) {
  var bkey = req.query.qc_upbookingid;

  var sqlsel = "select * from bookings where qc_bookingid = ?";
  var inserts = [bkey];

  var sql = mysql.format(sqlsel, inserts);

  con.query(sql, function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    res.send(JSON.stringify(data));
  });
});

// Edition Endpoints

app.post("/updatesingleappointment", function (req, res) {
  var qc_apptid = req.body.qc_upaptid;
  var qc_apptdate = req.body.qc_upaptdate;
  var qc_appttime = req.body.qc_upapttime;
  var qc_apptlength = req.body.qc_upaptlength;
  var qc_apptuserid = req.body.qc_upaptuserid;
  var qc_apptclientid = req.body.qc_upaptclientid;
  var qc_apptserviceid = req.body.qc_upaptserviceid;
  var qc_apptnotes = req.body.qc_upaptnotes;

  var sqlins =
    "UPDATE appointments SET qc_apptdate = ?, qc_appttime = ?, qc_apptlength = ?, " +
    " qc_apptuserid = ?, qc_apptclientid = ?, qc_apptserviceid = ?, qc_apptnotes = ? " +
    " WHERE qc_apptid = ?";

  var inserts = [
    qc_apptdate,
    qc_appttime,
    qc_apptlength,
    qc_apptuserid,
    qc_apptclientid,
    qc_apptserviceid,
    qc_apptnotes,
    qc_apptid,
  ];

  var sql = mysql.format(sqlins, inserts);
  console.log(sql);
  con.execute(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
    res.end();
  });
});

app.post("/updatesingleclient", function (req, res) {
  var qc_clientid = req.body.qc_UPclientid; // Assuming your update form has an 'qc_UPclientid' field
  var qc_clientfirstname = req.body.qc_UPclientfirstname;
  var qc_clientlastname = req.body.qc_UPclientlastname;
  var qc_clientphone = req.body.qc_UPclientphone;
  var qc_clientemail = req.body.qc_UPclientemail;
  var qc_clientaddress = req.body.qc_UPclientaddress;
  var qc_clientzip = req.body.qc_UPclientzip;

  var sqlins =
    "UPDATE clients SET qc_clientfirstname = ?, qc_clientlastname = ?, qc_clientphone = ?, " +
    " qc_clientemail = ?, qc_clientaddress = ?, qc_clientzip = ?" +
    " WHERE qc_clientid = ? "; // Assuming 'qc_clientid' is your primary key for updates
  var inserts = [
    qc_clientfirstname,
    qc_clientlastname,
    qc_clientphone,
    qc_clientemail,
    qc_clientaddress,
    qc_clientzip,
    qc_clientid,
  ];

  var sql = mysql.format(sqlins, inserts);
  console.log(sql);
  con.execute(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
    res.end();
  });
});

app.post("/updateproduct/", function (req, res) {
  var qc_productid = req.body.qc_productid;
  var qc_productName = req.body.qc_productName;
  var qc_productdesc = req.body.qc_productDescription;
  var qc_productQuantity = req.body.qc_productQuantity;
  var qc_productPrice = req.body.qc_productPrice;
  var qc_productCost = req.body.qc_productCost;

  var sqlins =
    "UPDATE product SET qc_productname = ?, qc_productdesc = ?, qc_productquantity = ?, " +
    " qc_productprice = ?, qc_productcost = ? " +
    " WHERE qc_productid = ? ";
  var inserts = [
    qc_productName,
    qc_productdesc,
    qc_productQuantity,
    qc_productPrice,
    qc_productCost,
    qc_productid,
  ];

  var sql = mysql.format(sqlins, inserts);
  console.log(sql);
  con.execute(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " product(s) updated");
    res.json(result);
  });
});

app.post("/updaterole/", function (req, res) {
  var qc_roleid = req.body.qc_roleid; // Assuming your update form sends 'qc_roleid'
  var qc_rolename = req.body.qc_rolename;
  var qc_roletype = req.body.qc_roletype;
  var qc_rolepermissions = req.body.qc_rolepermissions;

  var sqlins =
    "UPDATE role SET qc_rolename = ?, qc_roletype = ?, qc_rolepermissions = ? " +
    " WHERE qc_roleid = ? "; // Assuming 'qc_roleid' is your primary key for roles
  var inserts = [qc_rolename, qc_roletype, qc_rolepermissions, qc_roleid];

  var sql = mysql.format(sqlins, inserts);
  console.log(sql);
  con.execute(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " role(s) updated");
    res.json(result);
  });
});

app.post("/updatesale", function (req, res) {
  // Extract and map fields from the request body
  var qc_upsaleid = req.body.qc_upslesid;
  var qc_upsaleclientid = req.body.qc_upsleclientid;
  var qc_upsaleclientname = req.body.qc_upsleclientname;
  var qc_upsaleuserid = req.body.qc_upsleuserid;
  var qc_upsaledate = req.body.qc_upsledate;

  // Log the received data for debugging
  console.log("Received Sale Update Data:");
  console.log({
    qc_upsaleid,
    qc_upsaleclientid,
    qc_upsaleclientname,
    qc_upsaleuserid,
    qc_upsaledate,
  });

  // Validate required fields
  if (
    !qc_upsaleid ||
    !qc_upsaleclientid ||
    !qc_upsaleclientname ||
    !qc_upsaleuserid ||
    !qc_upsaledate
  ) {
    console.error("Validation Error: All required fields must be provided.");
    return res.status(400).send("All required fields must be provided.");
  }

  // Update the sales record
  const updateSaleQuery = `
    UPDATE sales
    SET qc_saleclientid = ?, qc_saleclientname = ?, qc_saleuserid = ?, qc_saledate = ?
    WHERE qc_salesid = ?
  `;
  const updateSaleParams = [
    qc_upsaleclientid,
    qc_upsaleclientname,
    qc_upsaleuserid,
    qc_upsaledate,
    qc_upsaleid,
  ];

  con.execute(updateSaleQuery, updateSaleParams, function (err, result) {
    if (err) {
      console.error("Error updating sale:", err);
      return res.status(500).send("Error updating sale.");
    }

    console.log("Sale updated successfully.");
    res.json({ saleUpdate: result });
  });
});

app.post("/updateservice/", function (req, res) {
  var qc_serviceid = req.body.qc_upservid;
  var qc_servicename = req.body.qc_upservname;
  var qc_servicelength = req.body.qc_upservlength;
  var qc_servicetype = req.body.qc_upservtype;
  var qc_servicenotes = req.body.qc_upservnote;
  var qc_servicecost = req.body.qc_upservcost;

  var sqlins =
    "UPDATE services SET qc_servicename = ?, qc_servicelength = ?, qc_servicetype = ?, qc_servicenotes = ?, qc_servicecost = ? " +
    "WHERE qc_serviceid = ?";

  var inserts = [
    qc_servicename,
    qc_servicelength,
    qc_servicetype,
    qc_servicenotes,
    qc_servicecost,
    qc_serviceid,
  ];

  var sql = mysql.format(sqlins, inserts);
  console.log(sql);
  con.execute(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " service(s) updated");
    res.json(result);
  });
});

app.post("/updatesingleuser", function (req, res) {
  var qc_upuserid = req.body.qc_upid;
  var qc_upusername = req.body.qc_upname;
  var qc_upuseremail = req.body.qc_upemail;
  var qc_upuserfirstname = req.body.qc_upfname;
  var qc_upuserlastname = req.body.qc_uplname;
  var qc_upprefname = req.body.qc_upprefname;
  var qc_upphone = req.body.qc_upphone;
  var qc_upaddress = req.body.qc_upaddress;
  var qc_upzip = req.body.qc_upzip;
  var qc_upstartdate = req.body.qc_upstartdate;
  var qc_uproleid = req.body.qc_uproleid;
  var qc_upenddate = req.body.qc_upenddate;

  var sqlins =
    "UPDATE users SET qc_username = ?, qc_useremail = ?, " +
    " qc_userfirstname = ?, qc_userlastname = ?, qc_userpreferredname = ?, " +
    " qc_userphone = ?, qc_useraddress = ?, qc_userzip = ?, qc_userstartdate = ?, " +
    " qc_userroleid = ?, qc_userenddate = ? " +
    " WHERE qc_userid = ? ";

  var inserts = [
    qc_upusername,
    qc_upuseremail,
    qc_upuserfirstname,
    qc_upuserlastname,
    qc_upprefname,
    qc_upphone,
    qc_upaddress,
    qc_upzip,
    qc_upstartdate,
    qc_uproleid,
    qc_upenddate,
    qc_upuserid,
  ];

  var sql = mysql.format(sqlins, inserts);
  console.log(sql);

  con.execute(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " user(s) updated");
    res.end();
  });
});

app.post("/updatebooking", function (req, res) {
  var qc_bookingid = req.body.qc_upbookid;
  var qc_clientid = req.body.qc_upcliid;
  var qc_userid = req.body.qc_upusrid;
  var qc_appointmentdate = req.body.qc_upapptdate;
  var qc_appointmenttime = req.body.qc_upappttime;
  var qc_servicename = req.body.qc_upservname;
  var qc_servicetype = req.body.qc_upservtype;
  var qc_saletotal = req.body.qc_upsletotal;
  var qc_notes = req.body.qc_upntes;

  // SQL query to update the booking data
  var sqlins =
    "UPDATE bookings SET qc_clientid = ?, qc_userid = ?, qc_appointmentdate = ?, qc_appointmenttime = ?, " +
    "qc_servicename = ?, qc_servicetype = ?, qc_saletotal = ?, qc_notes = ? " +
    "WHERE qc_bookingid = ?";

  var inserts = [
    qc_clientid,
    qc_userid,
    qc_appointmentdate,
    qc_appointmenttime,
    qc_servicename,
    qc_servicetype,
    qc_saletotal,
    qc_notes,
    qc_bookingid,
  ];

  // Prepare the SQL query with the provided values
  var sql = mysql.format(sqlins, inserts);
  console.log(sql);

  // Execute the query to update the booking record
  con.execute(sql, function (err, result) {
    if (err) {
      console.error("Error updating booking:", err);
      return res.status(500).send("Error updating booking record.");
    }

    // Log and respond with the result
    console.log(result.affectedRows + " record(s) updated");
    res.json({ message: "Booking updated successfully", result: result });
  });
});

// Delete endpoints

// DELETE USER
app.post("/deleteuser", function (req, res) {
  const qc_userid = req.body.qc_userid;

  if (!qc_userid) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  const query = 'DELETE FROM users WHERE qc_userid = ?';

  db.query(query, [qc_userid], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// DELETE PRODUCT
app.post("/deleteproduct", function (req, res) {
  const qc_productid = req.body.qc_productid;

  if (!qc_productid) {
    return res.status(400).json({ error: 'Missing product ID' });
  }

  const query = 'DELETE FROM products WHERE qc_productid = ?';

  db.query(query, [qc_productid], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  });
});

// DELETE SALE
app.post("/deletesale", function (req, res) {
  const qc_salesid = req.body.qc_salesid;

  if (!qc_salesid) {
    return res.status(400).json({ error: 'Missing sales ID' });
  }

  const query = 'DELETE FROM sales WHERE qc_salesid = ?';

  db.query(query, [qc_salesid], (err, result) => {
    if (err) {
      console.error('Error deleting sale:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  });
});



app.listen(app.get("port"), function () {
  console.log("Server started: http://localhost:" + app.get("port") + "/");
});
