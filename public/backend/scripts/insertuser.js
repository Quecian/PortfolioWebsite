"use strict";
$(document).ready(function () {
  $.get("/getloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html"; // or your actual login path
    }
  });
});
var usruser = 0;

var UserBox = React.createClass({
  getInitialState: function () {
    return { viewthepage: 0 };
  },
  handleUserSubmit: function (user) {
    // Send the user data to the backend
    $.ajax({
      url: "/user",
      dataType: "json",
      type: "POST",
      data: user,
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
        url: '/getloggedin',
        dataType: 'json',
        cache: false,
        success: function (data) {
            this.setState({ viewthepage: data });
            usruser = this.state.viewthepage;
            console.log("Role ID " + this.state.viewthepage);
        }.bind(this),
        error: function (xhr, status, err) {
            console.error(this.props.url, status, err.toString());
        }.bind(this)
    });
}, 
componentDidMount: function () {
  this.loadAllowLogin();
},
  handleChange: function (event) {
    this.setState({ [event.target.id]: event.target.value });
  },

  render: function () {
    if (this.state.viewthepage == 3) {
        return (
            <div>You do not have access to this page.</div>
        );
    } else {
        return (
      <div className="theform">
        <h1>Users Management</h1>
        <UserForm onUserSubmit={this.handleUserSubmit} />
        <br />
      </div>
    );
  }},
});

var UserForm = React.createClass({
  getInitialState: function () {
    return {
      qc_username: "",
      qc_useremail: "",
      qc_userfirstname: "",
      qc_userlastname: "",
      qc_userpreferredname: "",
      qc_userphone: "",
      qc_useraddress: "",
     qc_userzip: "",
     qc_userstartdate: "",
      qc_userenddate: "",
      qc_userroleid: "",
      qc_userpassword: "",
      qc_password2: "",
      passwordMatchError: false,
      data: [],
    };
  },

  loadRoleTypes: function () {
    $.ajax({
      url: "/getroletypes",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadRoleTypes();
  },
  handleRoleChange: function (event) {
    this.setState({ qc_userroleid: event.target.value });
  },
  handleSubmit: function (e) {
    e.preventDefault();

    var qc_username = this.state.qc_username.trim();
    var qc_useremail = this.state.qc_useremail.trim();
    var qc_userfirstname = this.state.qc_userfirstname.trim();
    var qc_userlastname = this.state.qc_userlastname.trim();
    var qc_userpreferredname = this.state.qc_userpreferredname.trim();
    var qc_userphone = this.state.qc_userphone.trim();
    var qc_useraddress = this.state.qc_useraddress.trim();
    var qc_userzip = this.state.qc_userzip.trim();
    var qc_userstartdate = this.state.qc_userstartdate;
    var qc_userenddate = this.state.qc_userenddate;
    var qc_userroleid = this.state.qc_userroleid;
    var qc_userpassword = this.state.qc_userpassword;
    var qc_password2 = this.state.qc_password2;

    if (qc_userpassword !== qc_password2) {
      this.setState({ passwordMatchError: true });
      return;
    } else {
      this.setState({ passwordMatchError: false });
    }

    this.props.onUserSubmit({
      qc_username: qc_username,
      qc_useremail: qc_useremail,
      qc_userfirstname: qc_userfirstname,
      qc_userlastname: qc_userlastname,
      qc_userpreferredname: qc_userpreferredname,
      qc_userphone: qc_userphone,
      qc_useraddress: qc_useraddress,
      qc_userzip:qc_userzip,
      qc_userstartdate:qc_userstartdate,
      qc_userenddate: qc_userenddate,
      qc_userroleid: qc_userroleid,
      qc_userpassword: qc_userpassword,
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

  render: function () {
    return (
      <form className="userForm" onSubmit={this.handleSubmit}>
        <h2>User Details</h2>
        <table>
          <tbody>
            <tr>
              <th>Username</th>
              <td>
                <TextInput
                  value={this.state.qc_username}
                  uniqueName="qc_username"
                  required={true}
                  minCharacters={3}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_username")}
                  errorMessage="User Name is invalid"
                  emptyMessage="User Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td>
                <TextInput
                  value={this.state.qc_useremail}
                  uniqueName="qc_useremail"
                  required={true}
                  validate={this.validateEmail}
                  onChange={this.setValue.bind(this, "qc_useremail")}
                  errorMessage="Invalid Email"
                  emptyMessage="Email is required"
                />
              </td>
            </tr>
            <tr>
              <th>First Name</th>
              <td>
                <TextInput
                  value={this.state.qc_userfirstname}
                  uniqueName="qc_userfirstname"
                  required={false}
                  minCharacters={0}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_userfirstname")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>
                <TextInput
                  value={this.state.qc_userlastname}
                  uniqueName="qc_userlastname"
                  required={false}
                  minCharacters={0}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_userlastname")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Preferred Name</th>
              <td>
                <TextInput
                  value={this.state.qc_userpreferredname}
                  uniqueName="qc_userpreferredname"
                  required={false}
                  minCharacters={0}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_userpreferredname")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>
                <TextInput
                  value={this.state.qc_userphone}
                  uniqueName="qc_userphone"
                  required={false}
                  minCharacters={0}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_userphone")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Address</th>
              <td>
                <TextInput
                  value={this.state.qc_useraddress}
                  uniqueName="qc_useraddress"
                  required={false}
                  minCharacters={0}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_useraddress")}
                  errorMessage=""
                  emptyMessage=""
                />
              </td>
            </tr>
            <tr>
              <th>Zip</th>
              <td>
                <TextInput
                  value={this.state.qc_userzip}
                  uniqueName="qc_userzip"
                  required={false}
                  minCharacters={0}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_userzip")}
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
                  value={this.state.qc_userpassword}
                  uniqueName="qc_userpassword"
                  required={true}
                  minCharacters={6}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_userpassword")}
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
                  id="qc_password2"
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
            <tr>
              <th>Start Date</th>
              <td>
                <input
                  type="date"
                  name="qc_userstartdate"
                  id="qc_userstartdate"
                  value={this.state.qc_userstartdate}
                  onChange={this.setValue.bind(this, "qc_userstartdate")}
                />
              </td>
            </tr>
            <tr>
              <th>End Date</th>
              <td>
                <input
                  type="date"
                  name="qc_userenddate"
                  id="qc_userenddate"
                  value={this.state.qc_userenddate}
                  onChange={this.setValue.bind(this, "qc_userenddate")}
                />
              </td>
            </tr>
            <tr>
              <th>Role</th>
              <td>
                <SelectList
                  data={this.state.data}
                  onChange={this.setValue.bind(this, "qc_userroleid")}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Insert User" />
      </form>
    );
  },

  commonValidate: function () {
    return true;
  },
});

var SelectList = React.createClass({
  render: function () {
    var optionNodes = this.props.data.map(function (role) {
      return (
        <option key={role.qc_roleid} value={role.qc_roleid}>
          {role.qc_rolename}
        </option>
      );
    });

    return (
      <select
        name="qc_userroleid"
        id="qc_userroleid"
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select a Role</option>
        {optionNodes}
      </select>
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

ReactDOM.render(<UserBox />, document.getElementById("content"));
