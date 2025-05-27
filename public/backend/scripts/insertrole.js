"use strict";
$(document).ready(function () {
  $.get("/usrgetloggedin/", function (data) {
    if (parseInt(data) === 0) {
      window.location.href = "/backend/login.html"; // or your actual login path
    }
  });
});
var usruser = 0;

var RoleBox = React.createClass({
  getInitialState: function () {
    return { viewthepage: 0 };
  },
  handleRoleSubmit: function (role) {
    $.ajax({
      url: "/role", // Updated endpoint for roles
      dataType: "json",
      type: "POST",
      data: role,
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
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="RoleBox">
          <h1>Roles</h1>
          <RoleForm onRoleSubmit={this.handleRoleSubmit} />
        </div>
      );
    }
  },
});
var RoleForm = React.createClass({
  getInitialState: function () {
    return {
      qc_rolename: "",
      qc_roletype: "",
      qc_rolepermissions: "",
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();

    // Extract form values
    var qc_rolename = this.state.qc_rolename.trim();
    var qc_roletype = this.state.qc_roletype.trim();
    var qc_rolepermissions = this.state.qc_rolepermissions.trim();

    // Validate required fields
    if (!qc_rolename || !qc_roletype || !qc_rolepermissions) {
      console.log("Field Missing");
      return;
    }

    // Prepare data to submit
    var roleData = {
      qc_rolename: qc_rolename,
      qc_roletype: qc_roletype,
      qc_rolepermissions: qc_rolepermissions,
    };

    this.props.onRoleSubmit(roleData);
  },

  setValue: function (field, event) {
    var object = {};
    object[field] = event.target.value;
    this.setState(object);
  },

  render: function () {
    return (
      <form className="roleForm" onSubmit={this.handleSubmit}>
        <h2>Role Details</h2>
        <table>
          <tbody>
            <tr>
              <th>Role Name</th>
              <td>
                <TextInput
                  value={this.state.qc_rolename}
                  uniqueName="qc_rolename"
                  required={true}
                  minCharacters={3}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_rolename")}
                  errorMessage="Role Name is required"
                  emptyMessage="Role Name is required"
                />
              </td>
            </tr>
            <tr>
              <th>Role Type</th>
              <td>
                <TextInput
                  value={this.state.qc_roletype}
                  uniqueName="qc_roletype"
                  required={true}
                  minCharacters={3}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_roletype")}
                  errorMessage="Role Type is required"
                  emptyMessage="Role Type is required"
                />
              </td>
            </tr>
            <tr>
              <th>Role Permissions</th>
              <td>
                <TextInput
                  value={this.state.qc_rolepermissions}
                  uniqueName="qc_rolepermissions"
                  required={true}
                  minCharacters={3}
                  validate={this.commonValidate}
                  onChange={this.setValue.bind(this, "qc_rolepermissions")}
                  errorMessage="Role Permissions are required"
                  emptyMessage="Role Permissions are required"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <input type="submit" value="Insert Role" />
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

ReactDOM.render(<RoleBox />, document.getElementById("content"));
