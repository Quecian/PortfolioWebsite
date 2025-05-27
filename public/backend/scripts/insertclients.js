"use strict";

var usruser = 0;

var ClientBox = React.createClass({
  getInitialState: function () {
    return { viewthepage: 0 };
  },
  handleClientSubmit: function (client) {
    $.ajax({
      url: "/client",
      dataType: "json",
      type: "POST",
      data: client,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/client", status, err.toString());
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
    if (this.state.viewthepage == 0) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="theform">
          <h1>Clients Management</h1>
          <ClientForm onClientSubmit={this.handleClientSubmit} />
          <br />
        </div>
      );
    }
  },
});

var ClientForm = React.createClass({
  getInitialState: function () {
    return {
      qc_clientlastname: "",
      qc_clientfirstname: "",
      qc_clientphone: "",
      qc_clientemail: "",
      qc_clientaddress: "",
      qc_clientzip: "",
      qc_clientpassword: "",
      qc_password2: "",
      passwordMatchError: false,
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();

    const {
      qc_clientlastname,
      qc_clientfirstname,
      qc_clientphone,
      qc_clientemail,
      qc_clientaddress,
      qc_clientzip,
      qc_clientpassword,
      qc_password2,
    } = this.state;

    if (qc_clientpassword !== qc_password2) {
      this.setState({ passwordMatchError: true });
      return;
    } else {
      this.setState({ passwordMatchError: false });
    }

    this.props.onClientSubmit({
      qc_clientlastname: qc_clientlastname.trim(),
      qc_clientfirstname: qc_clientfirstname.trim(),
      qc_clientphone: qc_clientphone.trim(),
      qc_clientemail: qc_clientemail.trim(),
      qc_clientaddress: qc_clientaddress.trim(),
      qc_clientzip: qc_clientzip.trim(),
      qc_clientpassword: qc_clientpassword,
    });
  },

  validateEmail: function (value) {
    var re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },

  setValue: function (field, event) {
    var object = {};
    object[field] = event.target.value;
    this.setState(object);
  },

  commonValidate: function () {
    return true;
  },

  render: function () {
    return (
      <form className="clientForm" onSubmit={this.handleSubmit}>
        <h2>Client Details</h2>
        <table>
          <tbody>
            <tr>
              <th>First Name</th>
              <td>
                <TextInput
                  value={this.state.qc_clientfirstname}
                  uniqueName="qc_clientfirstname"
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_clientfirstname")}
                  errorMessage="First Name is required"
                  emptyMessage="First Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>
                <TextInput
                  value={this.state.qc_clientlastname}
                  uniqueName="qc_clientlastname"
                  required={true}
                  minCharacters={1}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_clientlastname")}
                  errorMessage="Last Name is required"
                  emptyMessage="Last Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>
                <TextInput
                  value={this.state.qc_clientphone}
                  uniqueName="qc_clientphone"
                  required={false}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_clientphone")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td>
                <TextInput
                  value={this.state.qc_clientemail}
                  uniqueName="qc_clientemail"
                  required={false}
                  validate={this.validateEmail}
                  onChange={this.setValue.bind(this, "qc_clientemail")}
                  errorMessage="Invalid Email"
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Address</th>
              <td>
                <TextInput
                  value={this.state.qc_clientaddress}
                  uniqueName="qc_clientaddress"
                  required={false}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_clientaddress")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Zip</th>
              <td>
                <TextInput
                  value={this.state.qc_clientzip}
                  uniqueName="qc_clientzip"
                  required={false}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_clientzip")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Password</th>
              <td>
                <TextInput
                  inputType="password"
                  value={this.state.qc_clientpassword}
                  uniqueName="qc_clientpassword"
                  required={true}
                  minCharacters={6}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_clientpassword")}
                  errorMessage="Password is invalid"
                  emptyMessage="Password is required"
                />
              </td>
            </tr>
            <tr>
              <th>Confirm Password</th>
              <td>
                <TextInput
                  inputType="password"
                  value={this.state.qc_password2}
                  uniqueName="qc_password2"
                  required={true}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_password2")}
                  errorMessage="Passwords do not match"
                  emptyMessage="Confirm Password is required"
                />
                {this.state.passwordMatchError && (
                  <InputError
                    visible={true}
                    errorMessage="Passwords do not match"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Insert Client" />
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

    return <td>{this.props.errorMessage}</td>;
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
    } else {
      return (
        <div className={this.props.uniqueName}>
          <input
            type={this.props.inputType}
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

ReactDOM.render(<ClientBox />, document.getElementById("content"));
