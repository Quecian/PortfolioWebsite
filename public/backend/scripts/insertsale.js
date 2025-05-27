var usruser = 0;

var SalesBox = React.createClass({
  getInitialState: function () {
    return {
      data: [],
      clients: [],
      users: [],
      products: [],
      viewthepage: 0,
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

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadClientsFromServer();
    this.loadUsersFromServer();
    this.loadProductsFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 3) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="SalesBox">
          <h1>Insert New Sale</h1>
          <SalesForm
            clients={this.state.clients}
            products={this.state.products}
            users={this.state.users}
          />
        </div>
      );
    }
  },
});

var SalesForm = React.createClass({
  getInitialState: function () {
    return {
      qc_productid: "",
      qc_salequantity: "",
      qc_salesubtotal: "",
      qc_saletax: "",
      qc_saletotal: "",
      qc_saleclientname: "",
      qc_saleclientid: "",
      qc_saleuserid: "",
      qc_saledate: "",
      qc_productPrice: "",
      qc_productquantitymax: 0,
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var data = {
      qc_productid: this.state.qc_productid,
      qc_salequantity: this.state.qc_salequantity,
      qc_saleclientname: this.state.qc_saleclientname,
      qc_saleclientid: this.state.qc_saleclientid,
      qc_salesubtotal: this.state.qc_salesubtotal,
      qc_saletax: this.state.qc_saletax,
      qc_saletotal: this.state.qc_saletotal,
      qc_saledate: this.state.qc_saledate,
      usersaleid: this.state.usersaleid,
    };

    $.ajax({
      type: "POST",
      url: "/sales",
      data: this.state,
      success: function (response) {
        alert("Sale inserted successfully!");
      },
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      },
    });
    window.location.reload(true);
  },

  handleChange: function (event) {
    var id = event.target.id;
    var value = event.target.value;
    var newState = {};

    // When product is selected
    if (id === "qc_productid") {
      for (var i = 0; i < this.props.products.length; i++) {
        var product = this.props.products[i];
        if (product.qc_productid.toString() === value) {
          var price = parseFloat(product.qc_productprice) || 0;
          var maxQty = parseInt(product.qc_productquantity) || 0;

          newState.qc_productprice = price;
          newState.qc_productquantitymax = maxQty;

          // Reset dependent fields
          newState.qc_salequantity = "";
          newState.qc_salesubtotal = "";
          newState.qc_saletax = "";
          newState.qc_saletotal = "";
          break;
        }
      }
    }

    // When quantity is updated
    if (id === "qc_salequantity") {
      var qty = Math.max(
        0,
        Math.min(parseInt(value) || 0, this.state.qc_productquantitymax)
      );
      var subtotal = +(this.state.qc_productprice * qty).toFixed(2);
      var tax = +(subtotal * 0.15).toFixed(2);
      var total = +(subtotal + tax).toFixed(2);

      newState.qc_salequantity = qty;
      newState.qc_salesubtotal = subtotal;
      newState.qc_saletax = tax;
      newState.qc_saletotal = total;
    }

    // When client is selected
    if (id === "qc_saleclientid") {
      for (var j = 0; j < this.props.clients.length; j++) {
        var client = this.props.clients[j];
        if (client.qc_clientid.toString() === value) {
          newState.qc_saleclientname = client.qc_clientlastname;
          break;
        }
      }
    }

    // Default field assignment
    newState[id] = value;

    this.setState(newState);
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
                <th>Price (Each)</th>
                <td>
                  <input
                    type="text"
                    value={this.state.qc_productprice}
                    readOnly
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <th>Quantity (Max: {this.state.qc_productquantitymax})</th>
                <td>
                  <input
                    type="number"
                    id="qc_salequantity"
                    min="0"
                    max={this.state.qc_productquantitymax}
                    value={this.state.qc_salequantity}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Subtotal</th>
                <td>
                  <input
                    type="number"
                    id="qc_salesubtotal"
                    value={this.state.qc_salesubtotal}
                    readOnly
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <th>Tax (15%)</th>
                <td>
                  <span>
                    {isNaN(this.state.qc_salesubtotal) ||
                    this.state.qc_salesubtotal === ""
                      ? "0.00"
                      : (parseFloat(this.state.qc_salesubtotal) * 0.15).toFixed(
                          2
                        )}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Total</th>
                <td>
                  <strong>
                    {isNaN(this.state.qc_salesubtotal) ||
                    this.state.qc_salesubtotal === ""
                      ? "0.00"
                      : (parseFloat(this.state.qc_salesubtotal) * 1.15).toFixed(
                          2
                        )}
                  </strong>
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
                <th>Client Name</th>
                <td>
                  <input
                    type="text"
                    value={this.state.qc_saleclientname}
                    disabled
                    readOnly
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
          <input type="submit" value="Insert Sale" />
        </form>
      </div>
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

ReactDOM.render(<SalesBox />, document.getElementById("content"));
