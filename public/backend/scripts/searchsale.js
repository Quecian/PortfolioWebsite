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
        clients: [],
        users: [],
        products: [],
        viewthepage: 0
      };
    },
    loadAllowLogin: function () {
      $.ajax({
          url: '/getloggedin',
          dataType: 'json',
          cache: false,
          success: function (data) {
              this.setState({ viewthepage: data });
              usruser = this.state.viewthepage;
          }.bind(this),
          error: function (xhr, status, err) {
              console.error(this.props.url, status, err.toString());
          }.bind(this)
      });
  }, 
  
    loadSalesFromServer: function () {
        $.ajax({
          url: "/getsales",
          data: {
            qc_productid: qc_productid.value,
            qc_saletax: qc_saletax.value,
            qc_saletotal: qc_saletotal.value,
            qc_saleclientname: qc_saleclientname.value,
            qc_salequantity: qc_salequantity.value,
            qc_salesubtotal: qc_salesubtotal.value,
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
      
  
    loadClientsFromServer: function () {
      $.ajax({
        url: "/getclienttypes",
        dataType: "json",
        cache: false,
        success: function (clients) {
          this.setState({ clients: clients });
        }.bind(this),
        error: function (xhr, status, err) {
          console.error("/getclienttypes", status, err.toString());
        }.bind(this),
      });
    },
  
    loadProductsFromServer: function () {
      $.ajax({
        url: "/getproducts",
        dataType: "json",
        cache: false,
        success: function (products) {
          this.setState({ products: products });
        }.bind(this),
        error: function (xhr, status, err) {
          console.error("/getproducts", status, err.toString());
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
          console.error("/getusertypes", status, err.toString());
        }.bind(this),
      });
    },
  
    componentDidMount: function () {
      this.loadSalesFromServer();
      this.loadClientsFromServer();
      this.loadUsersFromServer();
      this.loadProductsFromServer();
    },
  
    render: function () {
      return (
        <div className="box">
          <h1>Sales Management</h1>
          <SalesForm
            clients={this.state.clients}
            products={this.state.products}
            users={this.state.users}
            onSalesSubmit={this.loadSalesFromServer}
          />
          <br />
          <div id="theform">
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
                </tr>
              </thead>
              <SalesList data={this.state.data} />
            </table>
          </div>
        </div>
      );
    },
  });
  
  var SalesForm = React.createClass({
    getInitialState: function () {
      return {
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
      };
    },
  
    handleSubmit: function (e) {
        e.preventDefault();
    
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
            qc_productid: qc_productid,
            qc_salequantity: qc_salequantity,
            qc_salesubtotal: qc_salesubtotal,
            qc_saletax: qc_saletax,
            qc_saletotal: qc_saletotal,
            qc_saleclientname: qc_saleclientname,
            qc_saleclientid: qc_saleclientid,
            qc_saleuserid: qc_saleuserid,
            qc_saledate: qc_saledate
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
                        products={this.props.products}
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
                        clients={this.props.clients}
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
                        users={this.props.users}
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
              <input type = "hidden" name = "qc_saletax" id = "qc_saletax"/>
              <input type = "hidden" name = "qc_saletotal" id = "qc_saletotal"/>
              <input type = "hidden" name = "qc_saleclientname" id = "qc_saleclientname"/>
              <input type=  "hidden" name = "qc_salesubtotal" id= "qc_salesubtotal"/>
              <input type=  "hidden" name = "qc_salequantity" id= "qc_salequantity"/>
              <input type="submit" value="Search Sale" />
            </form>
          </div>
        );
      }, 
  });
  
  var SalesList = React.createClass({
    render: function () {
      var saleNodes = this.props.data.map(function (sales) {
        return (
          <tr key={sales.qc_salesid}>
            <td>{sales.qc_salesid}</td>
            <td>{sales.qc_productid}</td>
            <td>{sales.qc_salequantity}</td>
            <td>{sales.qc_salesubtotal}</td>
            <td>{sales.qc_saletax}</td>
            <td>{sales.qc_saletotal}</td>
            <td>{sales.qc_saleclientname}</td>
            <td>{sales.qc_saleclientid}</td>
            <td>{sales.qc_saleuserid}</td>
            <td>{formatDateOnly(sales.qc_saledate)}</td>            <td></td>
          </tr>
        );
      });
  
      return <tbody>{saleNodes}</tbody>;
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
  
  ReactDOM.render(<SalesBox />, document.getElementById("content"));
  