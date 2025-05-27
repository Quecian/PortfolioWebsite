"use strict";
$(document).ready(function () {
  $.get("/usrgetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html"; // or your actual login path
    }
  });
});

function formatDateOnly(datetimeString) {
  return new Date(datetimeString).toISOString().split("T")[0];
};
var usruser = 0;

var SalesBox = React.createClass({
  getInitialState: function () {
    return {
      data: [],
      updata: [],
      clients: [],
      users: [],
      products: [],
      upclients: [],
      upusers: [],
      upproducts: [],
      viewthepage: 0
    };
  },
  loadAllowLogin: function () {
    $.ajax({
      url: "/getloggedin",
      dataType: "json",
      cache: false,
      success: function (data) {
        console.log("Received login check:", data);
        this.setState({ viewthepage: data });
        usruser = data;
  
        if (data === 0) {
          window.location.href = "/backend/index.html";
        } else {
          console.log("Access granted for user: ", data);
          this.loadSalesFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  }, 

  loadSalesFromServer: function () {
    $.ajax({
      url: "/getsales",
      data: {
        qc_saleid: qc_saleid.value,
        qc_productid: qc_productid.value,
        qc_salequantity: qc_salequantity.value,
        qc_salesubtotal: qc_salesubtotal.value,
        qc_saletax: qc_saletax.value,
        qc_saletotal: qc_saletotal.value,
        qc_saleclientname: qc_saleclientname.value,
        qc_saleuserid: qc_saleuserid.value,
        qc_saleclientid: qc_saleclientid.value,
        qc_saledate: qc_saledate.value,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getsales", status, err.toString());
      }.bind(this),
    });
  },

  updateSingleSaleFromServer: function (sale) {
    $.ajax({
      url: "/updatesale/",
      dataType: "json",
      data: sale,
      type: "POST",
      cache: false,
      success: function (updatedData) {
        console.log("Sale updated:", updatedData);
        this.loadSalesFromServer();
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
    //window.location.reload(true);
  },

  componentDidMount: function () {
    this.loadSalesFromServer();
    this.loadAllowLogin();
  },

  render: function () {
    if (this.state.viewthepage == 3) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
      <div className="SalesBox">
        <h1>Sales Management</h1>
        <SalesForm
          onSalesSubmit={this.loadSalesFromServer}
          handleChange={this.handleChange}
          clients={this.state.clients}
          products={this.state.products}
          users={this.state.users}
        />
        <br />
        <div id="theresults">
          <div id="theleft">
            <table>
              <thead>
                <tr>
                  <th>Sales ID</th>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Client Name</th>
                  <th>Client ID</th>
                  <th>User ID</th>
                  <th>Sale Date</th>
                  <th></th>
                </tr>
              </thead>
              <SalesList data={this.state.data} />
            </table>
          </div>
          <div id="theright">
            <SalesUpdateForm
              onUpdateSubmit={this.updateSingleSaleFromServer}
              upclients={this.state.upclients}
              upproducts={this.state.upproducts}
              upusers={this.state.upusers}
            />
          </div>
        </div>
      </div>
    );
 } },
});

var SalesForm = React.createClass({
  getInitialState: function () {
    return {
      qc_saleid: "",
      qc_productid: "",
      qc_salequantity: "",
      qc_salesubtotal: "",
      qc_saleclientid: "",
      qc_saleuserid: "",
      qc_saledate: "",
      qc_saletotal: "",
      qc_saletax: "",
      qc_saleclientname: "",
      qc_productprice: "",
      qc_productquantitymax: 0,
      data: [],
      clients: [],
      users: [],
      products: [],
    };
  },

  loadClientsFromServer: function () {
    $.ajax({
      url: "/getclienttypes",
      dataType: "json",
      cache: false,
      success: function (clients) {
        this.setState({ clients: clients });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadUsersFromServer: function () {
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      cache: false,
      success: function (users) {
        this.setState({ users: users });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadProductsFromServer: function () {
    $.ajax({
      url: "/getproducts", // New endpoint to get products for dropdown
      dataType: "json",
      cache: false,
      success: function (products) {
        this.setState({ products: products });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadClientsFromServer();
    this.loadUsersFromServer();
    this.loadProductsFromServer();
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var qc_saleid = this.state.qc_saleid;
    var qc_productid = this.state.qc_productid;
    var qc_salequantity = this.state.qc_salequantity;
    var qc_salesubtotal = this.state.qc_salesubtotal;
    var qc_saletax = this.state.qc_saletax;
    var qc_saletotal = this.state.qc_saletotal;
    var qc_saleclientname = this.state.qc_saleclientname;
    var qc_saleclientid = this.state.qc_saleclientid;
    var qc_saleuserid = this.state.qc_saleuserid;
    var qc_saledate = this.state.qc_saledate;

    this.props.onSalesSubmit({
      qc_saleid: qc_saleid,
      qc_productid: qc_productid,
      qc_salequantity: qc_salequantity,
      qc_salesubtotal: qc_salesubtotal,
      qc_saletax: qc_saletax,
      qc_saletotal: qc_saletotal,
      qc_saleclientname: qc_saleclientname,
      qc_saleclientid: qc_saleclientid,
      qc_saleuserid: qc_saleuserid,
      qc_saledate: qc_saledate,
    });
  },

  handleChange: function (event) {
    this.setState({ [event.target.id]: event.target.value });
  },

  render: function () {
    return (
      <div id="theform">
        <form className="salesForm" onSubmit={this.handleSubmit}>
          <h2>Insert Sale</h2>
          <table>
            <tbody>
              <tr>
                <th>Product ID</th>
                <td>
                  <ProductDropdown
                    id="qc_productid"
                    value={this.state.qc_productid}
                    onChange={this.handleChange}
                    products={this.state.products}
                  />
                </td>
              </tr>
              <tr>
                <th>Client ID</th>
                <td>
                  <ClientDropdown
                    id="qc_saleclientid"
                    value={this.state.qc_saleclientid}
                    onChange={this.handleChange}
                    clients={this.state.clients}
                  />
                </td>
              </tr>
              <tr>
                <th>User ID</th>
                <td>
                  <UserDropdown
                    id="qc_saleuserid"
                    value={this.state.qc_saleuserid}
                    onChange={this.handleChange}
                    users={this.state.users}
                  />
                </td>
              </tr>
              <tr>
                <th>Sale Date</th>
                <td>
                  <input
                    type="date"
                    id="qc_saledate"
                    value={this.state.qc_saledate}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <input type="hidden" name="qc_saleid" id="qc_saleid" />
          <input type="hidden" name="qc_saletax" id="qc_saletax" />
          <input type="hidden" name="qc_saletotal" id="qc_saletotal" />
          <input type="hidden" name="qc_saleclientname" id="qc_saleclientname" />
          <input type="hidden" name="qc_salesubtotal" id="qc_salesubtotal" />
          <input type="hidden" name="qc_salequantity" id="qc_salequantity" />
          <input type="submit" value="Search Sale" />
        </form>
      </div>
    );
  },
});

var SalesUpdateForm = React.createClass({
  getInitialState: function () {
    return {
      // Required fields to update
      qc_upsaleclientid: "",
      qc_upsaleclientname: "",
      qc_upsaleuserid: "",
      qc_upsaledate: "",
      qc_upsaleid: "",

      // Dropdown data
      upclients: [],
      upusers: [],
    };
  },

  handleUpSubmit: function (e) {
    e.preventDefault();
  
    var qc_upsaleclientid = qc_upsleclientid.value;
    var qc_upsaleclientname = qc_upsleclientname.value;
    var qc_upsaleuserid = qc_upsleuserid.value;
    var qc_upsaledate = formatDateOnly(qc_upsledate.value);
    var qc_upsaleid = qc_upslesid.value;
  
    this.props.onUpdateSubmit({
      qc_upsleclientid: qc_upsaleclientid,
      qc_upsleclientname: qc_upsaleclientname,
      qc_upsleuserid: qc_upsaleuserid,
      qc_upsledate: qc_upsaledate,
      qc_upslesid: qc_upsaleid,
    });
  },

  loadClientsFromServer: function () {
    $.ajax({
      url: "/getclienttypes",
      dataType: "json",
      cache: false,
      success: function (upclients) {
        this.setState({ upclients: upclients });
      }.bind(this),
    });
  },

  loadUsersFromServer: function () {
    $.ajax({
      url: "/getusertypes",
      dataType: "json",
      cache: false,
      success: function (upusers) {
        this.setState({ upusers: upusers });
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadClientsFromServer();
    this.loadUsersFromServer();
  },

  handleUpChange: function (event) {
    const id = event.target.id;
    const value = event.target.value;
    const newState = {};

    if (id === "qc_upsleclientid") {
      for (let client of this.state.upclients) {
        if (client.qc_clientid.toString() === value) {
          newState.qc_upsaleclientid = value;
          newState.qc_upsaleclientname = client.qc_clientlastname;
          break;
        }
      }
    } else {
      newState[id] = value;
    }

    this.setState(newState);
  },

  render: function () {
    return (
      <div id="theform">
        <form onSubmit={this.handleUpSubmit}>
          <h2>Update Sale</h2>
          <table>
            <tbody>
              <tr>
                <th>Client ID</th>
                <td>
                  <ClientUpdateDropdown
                    id="qc_upsleclientid"
                    value={this.state.qc_upsleclientid}
                    onChange={this.handleUpChange}
                    upclients={this.state.upclients}
                  />
                </td>
              </tr>
              <tr>
                <th>Client Name</th>
                <td>
                  <input
                    type="text"
                    id="qc_upsleclientname"
                    value={this.state.qc_upsleclientname}
                    disabled
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <th>User ID</th>
                <td>
                  <UserUpdateDropdown
                    id="qc_upsleuserid"
                    value={this.state.qc_upsleuserid}
                    onChange={this.handleUpChange}
                    upusers={this.state.upusers}
                  />
                </td>
              </tr>
              <tr>
                <th>Sale Date</th>
                <td>
                  <input
                    type="date"
                    id="qc_upsledate"
                    value={this.state.qc_upsledate}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Hidden input to track sale ID */}
          <input
            type="hidden"
            id="qc_upslesid"
            value={this.state.qc_upslesid}
          />

          <input type="submit" value="Update Sale" />
        </form>
      </div>
    );
  },
});


var SalesList = React.createClass({
  render: function () {
    var saleNodes = this.props.data.map(function (sales) {
      return (
        <Sale
          key={sales.qc_salesid}
          qc_salesid={sales.qc_salesid}
          qc_productid={sales.qc_productid}
          qc_salequantity={sales.qc_salequantity}
          qc_salesubtotal={sales.qc_salesubtotal}
          qc_saletax={sales.qc_saletax}
          qc_saletotal={sales.qc_saletotal}
          qc_saleclientname={sales.qc_saleclientname}
          qc_saleclientid={sales.qc_saleclientid}
          qc_saleuserid={sales.qc_saleuserid}
          qc_saledate={sales.qc_saledate}

        />
      );
    }, this);

    return <tbody>{saleNodes}</tbody>;
  },
});

var Sale = React.createClass({
  getInitialState: function () {
    return {
      qc_upsalekey: "",
      singledata: [],
    };
  },

  updateRecord: function (e) {
    e.preventDefault();
    var qc_theupsalekey = this.props.qc_salesid;

    this.loadSingleSale(qc_theupsalekey);
  },
  loadSingleSale: function (qc_theupsalekey) {
    $.ajax({
      url: "/getsinglesale",
      data: {
        qc_upsalekey: qc_theupsalekey,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ singledata: data });
        console.log(this.state.singledata);

        var populateSale = data.map(function (sale) {
          qc_upslesid.value = qc_theupsalekey;
          qc_upsleclientname.value = sale.qc_saleclientname;
          qc_upsleclientid.value = sale.qc_saleclientid;
          qc_upsleuserid.value = sale.qc_saleuserid;
          qc_upsledate.value = formatDateOnly(sale.qc_saledate);
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getsinglesale", status, err.toString());
      }.bind(this),
    });
  },

  render: function () {
    return (
      <tr>
        <td>{this.props.qc_salesid}</td>
        <td>{this.props.qc_productid}</td>
        <td>{this.props.qc_salequantity}</td>
        <td>{this.props.qc_salesubtotal}</td>
        <td>{this.props.qc_saletax}</td>
        <td>{this.props.qc_saletotal}</td>
        <td>{this.props.qc_saleclientname}</td>
        <td>{this.props.qc_saleclientid}</td>
        <td>{this.props.qc_saleuserid}</td>
        <td>{formatDateOnly(this.props.qc_saledate)}</td>
        <td>
          <form onSubmit={this.updateRecord}>
            <input type="submit" value="Update Record" />
          </form>
        </td>
      </tr>
    );
  },
});

var ClientDropdown = React.createClass({
  render: function () {
    var clientOptions = this.props.clients.map(function (client) {
      return (
        <option key={client.qc_clientid} value={client.qc_clientid}>
          {client.qc_clientlastname}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select Client</option>
        {clientOptions}
      </select>
    );
  },
});

var UserDropdown = React.createClass({
  render: function () {
    var userOptions = this.props.users.map(function (user) {
      return (
        <option key={user.qc_userid} value={user.qc_userid}>
          {user.qc_username}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select User</option>
        {userOptions}
      </select>
    );
  },
});

var ProductDropdown = React.createClass({
  render: function () {
    var productOptions = this.props.products.map(function (product) {
      return (
        <option key={product.qc_productid} value={product.qc_productid}>
          {product.qc_productname}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select Product</option>
        {productOptions}
      </select>
    );
  },
});

var ClientUpdateDropdown = React.createClass({
  render: function () {
    var upclientOptions = this.props.upclients.map(function (upclient) {
      return (
        <option key={upclient.qc_clientid} value={upclient.qc_clientid}>
          {upclient.qc_clientlastname}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select Client</option>
        {upclientOptions}
      </select>
    );
  },
});

var UserUpdateDropdown = React.createClass({
  render: function () {
    var upuserOptions = this.props.upusers.map(function (upuser) {
      return (
        <option key={upuser.qc_userid} value={upuser.qc_userid}>
          {upuser.qc_username}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select User</option>
        {upuserOptions}
      </select>
    );
  },
});

var ProductUpdateDropdown = React.createClass({
  render: function () {
    var upproductOptions = this.props.upproducts.map(function (upproduct) {
      return (
        <option key={upproduct.qc_productid} value={upproduct.qc_productid}>
          {upproduct.qc_productname}
        </option>
      );
    });
    return (
      <select
        id={this.props.id}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select Product</option>
        {upproductOptions}
      </select>
    );
  },
});

ReactDOM.render(<SalesBox />, document.getElementById("content"));
