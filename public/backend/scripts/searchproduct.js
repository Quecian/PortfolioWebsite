"use strict";

var usruser = 0;

var ProductBox = React.createClass({
  getInitialState: function () {
    return { data: [], viewthepage: 0 };
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
          this.loadProductsFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadProductsFromServer: function () {
    $.ajax({
      url: "/getproduct", // Your endpoint to fetch products
      data: {
        "qc_productName": qc_productName.value,
        "qc_productDescription": qc_productDescription.value,
        "qc_productSKU": qc_productSKU.value,
        "qc_productQuantity": qc_productQuantity.value,
        "qc_productPrice": qc_productPrice.value,
        "qc_productCost": qc_productCost.value,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getproduct", status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadProductsFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 0) {
        return (
            <div>You do not have access to this page.</div>
        );
    } else {
        return (
      <div>
        <h1>Product Management</h1>
        <ProductForm
          onProductSubmit={this.loadProductsFromServer}
        />
        <br />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Cost</th>
            </tr>
          </thead>
          <ProductList data={this.state.data} />
        </table>
      </div>
    );
   }},
});

var ProductForm = React.createClass({
  getInitialState: function () {
    return {
      qc_productName: "",
      qc_productDescription: "",
      qc_productSKU: "",
      qc_productQuantity: "",
      qc_productPrice: "",
      qc_productCost: "",
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var qc_productName = this.state.qc_productName.trim();
    var qc_productDescription = this.state.qc_productDescription.trim();
    var qc_productSKU = this.state.qc_productSKU.trim();
    var qc_productQuantity = this.state.qc_productQuantity.trim();
    var qc_productPrice = this.state.qc_productPrice.trim();
    var qc_productCost = this.state.qc_productCost.trim();

    this.props.onProductSubmit({
      qc_productName: qc_productName,
      qc_productDescription: qc_productDescription,
      qc_productSKU: qc_productSKU,
      qc_productQuantity: qc_productQuantity,
      qc_productPrice: qc_productPrice,
      qc_productCost: qc_productCost,
    });
  },

  handleChange: function (event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  },

  render: function () {
    return (
      <form className="productForm" onSubmit={this.handleSubmit}>
        <table>
          <tbody>
            <tr>
              <th>Product Name</th>
              <td>
                <input
                  type="text"
                  name="qc_productName"
                  id="qc_productName"
                  placeholder="Product Name"
                  value={this.state.qc_productName}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Product Description</th>
              <td>
                <input
                  type="text"
                  name="qc_productDescription"
                  id="qc_productDescription"
                  placeholder="Product Description"
                  value={this.state.qc_productDescription}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Product SKU</th>
              <td>
                <input
                  type="text"
                  name="qc_productSKU"
                  id="qc_productSKU"
                  placeholder="Product SKU"
                  value={this.state.qc_productSKU}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Product Quantity</th>
              <td>
                <input
                  type="number"
                  name="qc_productQuantity"
                  id="qc_productQuantity"
                  placeholder="Product Quantity"
                  value={this.state.qc_productQuantity}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Retail Price</th>
              <td>
                <input
                  type="number"
                  step="0.01"
                  name="qc_productPrice"
                  id="qc_productPrice"
                  placeholder="Product Price"
                  value={this.state.qc_productPrice}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
            <tr>
              <th>Wholesale Price (per unit)</th>
              <td>
                <input
                  type="number"
                  step="0.01"
                  name="qc_productCost"
                  id="qc_productCost"
                  placeholder="Product Cost"
                  value={this.state.qc_productCost}
                  onChange={this.handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Search Product" />
      </form>
    );
  },
});

var ProductList = React.createClass({
  render: function () {
    var productNodes = this.props.data.map(function (product) {
      return (
        <Product
        key={product.qc_productid}
        qc_productid={product.qc_productid}
        qc_productName={product.qc_productname}
        qc_productDescription={product.qc_productdesc}
        qc_productSKU={product.qc_productsku}
        qc_productQuantity={product.qc_productquantity}
        qc_productPrice={product.qc_productprice}
        qc_productCost={product.qc_productcost}
    ></Product>
      );
    });

    return <tbody>{productNodes}</tbody>;
  },
});

var Product = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.qc_productName}</td>
        <td>{this.props.qc_productDescription}</td>
        <td>{this.props.qc_productSKU}</td>
        <td>{this.props.qc_productQuantity}</td>
        <td>{this.props.qc_productPrice}</td>
        <td>{this.props.qc_productCost}</td>
      </tr>
    );
  },
});

ReactDOM.render(<ProductBox />, document.getElementById("content"));
