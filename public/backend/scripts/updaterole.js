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
    return {
      data: [],
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
          this.loadRolesFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },
  
  

  loadRolesFromServer: function () {
    $.ajax({
      url: "/getroles",
      data: {
        qc_rolename: qc_rolename.value,
        qc_roletype: qc_roletype.value,
        qc_rolepermissions: qc_rolepermissions.value,
      },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/getroles", status, err.toString());
      }.bind(this),
    });
  },

  updateSingleRoleFromServer: function (role) {
    $.ajax({
      url: "/updaterole/",
      dataType: "json",
      data: role,
      type: "POST",
      cache: false,
      success: function (updatedData) {
        console.log("Role updated:", updatedData);
        this.loadRolesFromServer(); 
      }.bind(this),
      error: function (xhr, status, err) {
        console.error("/updaterole/", status, err.toString());
      }.bind(this),
    });
    window.location.reload(true);
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadRolesFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 3) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="RoleBox">
          <h1>Roles Management</h1>
          <RoleForm onRoleSubmit={this.loadRolesFromServer} />
          <br />
          <div id="theroles">
            <div id="theleft">
              <table>
                <thead>
                  <tr>
                    <th>Key</th> 
                    <th>Role Name</th>
                    <th>Role Type</th>
                    <th>Role Permissions</th>
                    <th></th> 
                  </tr>
                </thead>
                <RoleList data={this.state.data} />
              </table>
            </div>
            <div id="theright">
              <RoleUpdateForm
                onUpdateSubmit={this.updateSingleRoleFromServer}
              />
            </div>
          </div>
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
    this.props.onRoleSubmit();
  },

  handleChange: function (event) {
    this.setState({ [event.target.id]: event.target.value });
  },

  render: function () {
    return (
      <div id="theform">
        <form className="roleForm" onSubmit={this.handleSubmit}>
          <h2>Search Roles</h2>
          <table>
            <tbody>
              <tr>
                <th>Role Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_rolename"
                    id="qc_rolename"
                    placeholder="Role Name"
                    value={this.state.qc_rolename}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Role Type</th>
                <td>
                  <input
                    type="text"
                    name="qc_roletype"
                    id="qc_roletype"
                    placeholder="Role Type"
                    value={this.state.qc_roletype}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Role Permissions</th>
                <td>
                  <input
                    type="text"
                    name="qc_rolepermissions"
                    id="qc_rolepermissions"
                    placeholder="Role Permissions"
                    value={this.state.qc_rolepermissions}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <input type="submit" value="Search Roles" />
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

var RoleList = React.createClass({
  render: function () {
    var roleNodes = this.props.data.map(function (role) {
      return (
        <Role
          key={role.qc_roleid}
          qc_roleid={role.qc_roleid}
          qc_rolename={role.qc_rolename}
          qc_roletype={role.qc_roletype}
          qc_rolepermissions={role.qc_rolepermissions}
        ></Role>
      );
    });

    return <tbody>{roleNodes}</tbody>;
  },
});

var Role = React.createClass({
  updateRecord: function (e) {
    e.preventDefault();
    qc_uproleid.value = this.props.qc_roleid;
    qc_uprolename.value = this.props.qc_rolename;
    qc_uproletype.value = this.props.qc_roletype;
    qc_uprolepermissions.value = this.props.qc_rolepermissions;
  },

  render: function () {
    return (
      <tr>
        <td>{this.props.qc_roleid}</td>
        <td>{this.props.qc_rolename}</td>
        <td>{this.props.qc_roletype}</td>
        <td>{this.props.qc_rolepermissions}</td>
        <td>
          <form onSubmit={this.updateRecord}>
            <input type="submit" value="Select" />
          </form>
        </td>
      </tr>
    );
  },
});

var RoleUpdateForm = React.createClass({
  getInitialState: function () {
    return {
      qc_uproleid: "",
      qc_uprolename: "",
      qc_uproletype: "",
      qc_uprolepermissions: "",
    };
  },

  handleUpSubmit: function (e) {
    e.preventDefault();
    this.props.onUpdateSubmit({
      qc_roleid: qc_uproleid.value,
      qc_rolename: qc_uprolename.value,
      qc_roletype: qc_uproletype.value,
      qc_rolepermissions: qc_uprolepermissions.value,
    });
  },

  handleUpChange: function (event) {
    this.setState({ [event.target.id]: event.target.value });
  },

  render: function () {
    return (
      <div id="theform">
        <form onSubmit={this.handleUpSubmit}>
          <h2>Update Role</h2>
          <table>
            <tbody>
              <tr>
                <th>Role ID</th>
                <td>
                  <input
                    type="text"
                    name="qc_uproleid"
                    id="qc_uproleid"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <th>Role Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_uprolename"
                    id="qc_uprolename"
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Role Type</th>
                <td>
                  <input
                    type="text"
                    name="qc_uproletype"
                    id="qc_uproletype"
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Role Permissions</th>
                <td>
                  <input
                    type="text"
                    name="qc_uprolepermissions"
                    id="qc_uprolepermissions"
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <input type="submit" value="Update Role" />
        </form>
      </div>
    );
  },
});

ReactDOM.render(<RoleBox />, document.getElementById("content"));
