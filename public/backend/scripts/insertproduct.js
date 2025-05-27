"use strict";

var usruser = 0;

var ProductBox = React.createClass({
  getInitialState: function () {
    return { viewthepage: 0 };
  },
  // Handle submit button click for products
  handleProductSubmit: function (product) {
    // Send the product data to the backend
    $.ajax({
      url: "/product",
      dataType: "json",
      type: "POST",
      data: product,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
    window.location.reload(true);
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
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },
componentDidMount: function () {
  this.loadAllowLogin();
}, 


render: function () {
  if (this.state.viewthepage == 3) {
      return (
          <div>You do not have access to this page.</div>
      );
  } else {
      return (
      <div className="productBox">
        <h1>Product Management</h1>
        <ProductForm
          onProductSubmit={this.handleProductSubmit}
        />
      </div>
    );
 } },
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
  handleChange: function (event) {
    this.setState({
        [event.target.name]: event.target.value // Adjusts state using the `id` of the field
    });
},


handleSubmit: function (e) {
  e.preventDefault(); // Prevents the default form submission behavior

  var qc_productName = this.state.qc_productName.trim();
  var qc_productDescription = this.state.qc_productDescription.trim();
  var qc_productSKU = this.state.qc_productSKU.trim();
  var qc_productQuantity = this.state.qc_productQuantity.trim();
  var qc_productPrice = this.state.qc_productPrice.trim();
  var qc_productCost = this.state.qc_productCost.trim();

  // Pass product data to the parent handler
  this.props.onProductSubmit({
      qc_productName: qc_productName, 
      qc_productDescription: qc_productDescription, 
      qc_productSKU: qc_productSKU, 
      qc_productQuantity: qc_productQuantity, 
      qc_productPrice: qc_productPrice, 
      qc_productCost: qc_productCost
  });

  // Reset the form fields
  this.setState({
      qc_productName: "",
      qc_productDescription: "",
      qc_productSKU: "",
      qc_productQuantity: "",
      qc_productPrice: "",
      qc_productCost: ""
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
        <input type="submit" value="Add Product" />
      </form>
    );
  },
});

var InputError = React.createClass({
  getInitialState: function () {
    return {
      message: "Input is invalid",
    };
  },
  render: function () {
    var errorClass = classNames(this.props.className, {
      error_container: true,
      visible: this.props.visible,
      invisible: !this.props.visible,
    });

    return <td> {this.props.errorMessage} </td>;
  },
});

var TextInput = React.createClass({
  getInitialState: function () {
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "",
      errorVisible: false,
    };
  },

  handleChange: function (event) {
    this.validation(event.target.value);

    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },

  validation: function (value, valid) {
    if (typeof valid === "undefined") {
      valid = true;
    }

    var message = "";
    var errorVisible = false;

    if (!valid) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    } else if (this.props.required && jQuery.isEmptyObject(value)) {
      message = this.props.emptyMessage;
      valid = false;
      errorVisible = true;
    } else if (value.length < this.props.minCharacters) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }

    this.setState({
      value: value,
      isEmpty: jQuery.isEmptyObject(value),
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible,
    });
  },

  handleBlur: function (event) {
    var valid = this.props.validate(event.target.value);
    this.validation(event.target.value, valid);
  },
  render: function () {
    if (this.props.textArea) {
      return (
        <div className={this.props.uniqueName}>
          <textarea
            placeholder={this.props.text}
            className={"input input-" + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value}
          />

          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    } else {
      return (
        <div className={this.props.uniqueName}>
          <input
            name={this.props.uniqueName}
            id={this.props.uniqueName}
            placeholder={this.props.text}
            className={"input input-" + this.props.uniqueName}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={this.props.value}
          />

          <InputError
            visible={this.state.errorVisible}
            errorMessage={this.state.errorMessage}
          />
        </div>
      );
    }
  },
});

ReactDOM.render(<ProductBox />, document.getElementById("content"));
