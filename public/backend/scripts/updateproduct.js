"use strict";

var usruser = 0;

var ProductBox = React.createClass({
    getInitialState: function () {
        return { data: [], upsingledata: [], viewthepage: 0 };
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
            url: "/getproduct",
            data: {
                qc_productName: qc_productName.value,
                qc_productDescription: qc_productDescription.value,
                qc_productSKU: qc_productSKU.value,
                qc_productQuantity: qc_productQuantity.value,
                qc_productPrice: qc_productPrice.value,
                qc_productCost: qc_productCost.value,
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

    updateSingleProductFromServer: function (product) {
        $.ajax({
            url: "/updateproduct/",
            dataType: "json",
            data: product,
            type: "POST",
            cache: false,
            success: function (upsingledata) {
                this.setState({ upsingledata: upsingledata });
                this.loadProductsFromServer();
            }.bind(this),
            error: function (xhr, status, err) {
                console.error("/updateproduct/", status, err.toString());
            }.bind(this),
        });
        window.location.reload(true);
    },

    componentDidMount: function () {
        this.loadAllowLogin();
        this.loadProductsFromServer();
    },

    render: function () {
        if (this.state.viewthepage == 3) {
            return (
                <div>You do not have access to this page.</div>
            );
        } else {
            return (
            <div>
                <h1>Product Management</h1>
                <ProductForm onProductSubmit={this.loadProductsFromServer} />
                <br />
                <div id="theresults">
                    <div id="theleft">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>SKU</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Cost</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <ProductList data={this.state.data} />
                        </table>
                    </div>
                    <div id="theright">
                        <ProductUpdateForm onUpdateSubmit={this.updateSingleProductFromServer} />
                    </div>
                </div>
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

    handleSubmit: function (e) {
        e.preventDefault();
        this.props.onProductSubmit();
    },

    handleChange: function (event) {
        this.setState({ [event.target.id]: event.target.value });
    },

    render: function () {
        return (
            <div id="theform">
                <form onSubmit={this.handleSubmit}>
                    <h2>Search Products</h2>
                    <table>
                        <tbody>
                            <tr>
                                <th>Product Name</th>
                                <td>
                                    <input
                                        type="text"
                                        name="qc_productName"
                                        id="qc_productName"
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
                                        value={this.state.qc_productQuantity}
                                        onChange={this.handleChange}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>Product Price</th>
                                <td>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="qc_productPrice"
                                        id="qc_productPrice"
                                        value={this.state.qc_productPrice}
                                        onChange={this.handleChange}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>Product Cost</th>
                                <td>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="qc_productCost"
                                        id="qc_productCost"
                                        value={this.state.qc_productCost}
                                        onChange={this.handleChange}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <input type="submit" value="Search Product" />
                </form>
                <div>
                    <br />
                    <form onSubmit={this.getInitialState}>
                        <input type="submit" value="Clear Form" />
                    </form>
                </div>
            </div>
        );
    },
});

var ProductUpdateForm = React.createClass({
    getInitialState: function () {
        return {
            qc_upproductsku: "",
            qc_upproductname: "",
            qc_upproductdescription: "",
            qc_upproductquantity: "",
            qc_upproductprice: "",
            qc_upproductcost: "",
        };
    },

    handleUpSubmit: function (e) {
        e.preventDefault();
        this.props.onUpdateSubmit({
            qc_productid: qc_upproductid.value,
            qc_productSKU: qc_upproductsku.value,
            qc_productName: qc_upproductname.value,
            qc_productDescription: qc_upproductdescription.value,
            qc_productQuantity: qc_upproductquantity.value,
            qc_productPrice: qc_upproductprice.value,
            qc_productCost: qc_upproductcost.value,
        });
    },

    handleUpChange: function (event) {
        this.setState({ [event.target.id]: event.target.value });
    },

    render: function () {
        return (
            <div id="theform">
                <form onSubmit={this.handleUpSubmit}>
                    <h2>Update Product</h2>
                    <table>
                        <tbody>
                            <tr>
                                <th>Product SKU</th>
                                <td>
                                    <input type="text" name="qc_upproductsku" id="qc_upproductsku" onChange={this.handleUpChange} />
                                </td>
                            </tr>
                            <tr>
                                <th>Product Name</th>
                                <td>
                                    <input type="text" name="qc_upproductname" id="qc_upproductname" onChange={this.handleUpChange} />
                                </td>
                            </tr>
                            <tr>
                                <th>Product Description</th>
                                <td>
                                    <input type="text" name="qc_upproductdescription" id="qc_upproductdescription" onChange={this.handleUpChange} />
                                </td>
                            </tr>
                            <tr>
                                <th>Product Quantity</th>
                                <td>
                                    <input type="number" name="qc_upproductquantity" id="qc_upproductquantity" onChange={this.handleUpChange} />
                                </td>
                            </tr>
                            <tr>
                                <th>Retail Price</th>
                                <td>
                                    <input type="number" step="0.01" name="qc_upproductprice" id="qc_upproductprice" onChange={this.handleUpChange} />
                                </td>
                            </tr>
                            <tr>
                                <th>Wholesale Price (per unit)</th>
                                <td>
                                    <input type="number" step="0.01" name="qc_upproductcost" id="qc_upproductcost" onChange={this.handleUpChange} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <input type="hidden" name="qc_upproductid" id="qc_upproductid" onChange={this.handleUpChange} />
                    <input type="submit" value="Update Product" />
                </form>
            </div>
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
    updateRecord: function (e) {
        e.preventDefault();
        qc_upproductid.value = this.props.qc_productid;
        qc_upproductname.value = this.props.qc_productName; // Assuming global 'qc_upproductname'
        qc_upproductdescription.value = this.props.qc_productDescription; // Assuming global 'qc_upproductdescription'
        qc_upproductsku.value = this.props.qc_productSKU; // Assuming global 'qc_upproductsku'
        qc_upproductquantity.value = this.props.qc_productQuantity; // Assuming global 'qc_upproductquantity'
        qc_upproductprice.value = this.props.qc_productPrice; // Assuming global 'qc_upproductprice'
        qc_upproductcost.value = this.props.qc_productCost; // Assuming global 'qc_upproductcost'
    },

    render: function () {
        return (
            <tr>
                <td>{this.props.qc_productid}</td>
                <td>{this.props.qc_productName}</td>
                <td>{this.props.qc_productDescription}</td>
                <td>{this.props.qc_productSKU}</td>
                <td>{this.props.qc_productQuantity}</td>
                <td>{this.props.qc_productPrice}</td>
                <td>{this.props.qc_productCost}</td>
                <td>
                    <form onSubmit={this.updateRecord}>
                        <input type="submit" value="Update Record" />
                    </form>
                </td>
            </tr>
        );
    },
});

ReactDOM.render(<ProductBox />, document.getElementById("content"));