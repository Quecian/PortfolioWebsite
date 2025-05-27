"use strict";

function formatDateOnly(datetimeString) {
  return new Date(datetimeString).toISOString().split("T")[0];
}

var usruser = 0;

var UserBox = React.createClass({
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
          this.loadUsersFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadUsersFromServer: function () {
    $.ajax({
      url: "/getusers",
      data: {
        qc_username: qc_username.value,
        qc_useremail: qc_useremail.value,
        qc_userfirstname: qc_userfirstname.value,
        qc_userlastname: qc_userlastname.value,
        qc_userpreferredname: qc_userpreferredname.value,
        qc_userphone: qc_userphone.value,
        qc_useraddress: qc_useraddress.value,
        qc_userzip: qc_userzip.value,
        qc_userstartdate: qc_userstartdate.value,
        qc_userroleid: qc_userroleid.value,
        qc_userenddate: qc_userenddate.value,
      },
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

  updateSingleUserFromServer: function (user) {
    $.ajax({
      url: "/updatesingleuser",
      dataType: "json",
      data: user,
      type: "POST",
      cache: false,
      success: function (upsingledata) {
        this.setState({ upsingledata: upsingledata });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
    window.location.reload(true);
  },

  componentDidMount: function () {
    this.loadAllowLogin();
    this.loadUsersFromServer();
  },

  render: function () {
    if (this.state.viewthepage == 3) {
      return <div>You do not have access to this page.</div>;
    } else {
      return (
        <div className="UserBox">
          <h1>Users Management</h1>
          <UserForm onUserSubmit={this.loadUsersFromServer} />
          <br />
          <div id="theusers">
            <div id="theleft">
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Preferred Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Zip</th>
                    <th>Start Date</th>
                    <th>Role ID</th>
                    <th>End Date</th>
                    <th></th>
                  </tr>
                </thead>
                <UserList data={this.state.data} />
              </table>
            </div>
            <div id="theright">
              <UserUpdateForm
                onUpdateSubmit={this.updateSingleUserFromServer}
              />
            </div>
          </div>
        </div>
      );
    }
  },
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
      qc_userroleid: "",
      qc_userenddate: "",
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

    this.props.onUserSubmit({
      qc_username: qc_username,
      qc_useremail: qc_useremail,
      qc_userfirstname: qc_userfirstname,
      qc_userlastname: qc_userlastname,
      qc_userpreferredname: qc_userpreferredname,
      qc_userphone: qc_userphone,
      qc_useraddress: qc_useraddress,
      qc_userzip: qc_userzip,
      qc_userstartdate: qc_userstartdate,
      qc_userenddate: qc_userenddate,
      qc_userroleid: qc_userroleid,
    });
  },

  handleChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },

  render: function () {
    return (
      <div id="theform">
        <form onSubmit={this.handleSubmit}>
          <h2>Search Users</h2>
          <table>
            <tbody>
              <tr>
                <th>Username</th>
                <td>
                  <input
                    type="text"
                    name="qc_username"
                    id="qc_username"
                    value={this.state.qc_username}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td>
                  <input
                    type="text"
                    name="qc_useremail"
                    id="qc_useremail"
                    value={this.state.qc_useremail}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>First Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_userfirstname"
                    id="qc_userfirstname"
                    value={this.state.qc_userfirstname}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Last Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_userlastname"
                    id="qc_userlastname"
                    value={this.state.qc_userlastname}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Preferred Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_userpreferredname"
                    id="qc_userpreferredname"
                    value={this.state.qc_userpreferredname}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>
                  <input
                    type="text"
                    name="qc_userphone"
                    id="qc_userphone"
                    value={this.state.qc_userphone}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Address</th>
                <td>
                  <input
                    type="text"
                    name="qc_useraddress"
                    id="qc_useraddress"
                    value={this.state.qc_useraddress}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Zip</th>
                <td>
                  <input
                    type="text"
                    name="qc_userzip"
                    id="qc_userzip"
                    onChange={this.handleChange}
                  />
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
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Role ID</th>
                <td>
                  <SelectList data={this.state.data} />
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
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <input type="submit" value="Search User" />
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

var UserList = React.createClass({
  render: function () {
    var userNodes = this.props.data.map(function (user) {
      return (
        <User
          key={user.qc_userid}
          qc_userkey={user.qc_userid}
          qc_userid={user.qc_userid}
          qc_username={user.qc_username}
          qc_useremail={user.qc_useremail}
          qc_userfirstname={user.qc_userfirstname}
          qc_userlastname={user.qc_userlastname}
          qc_userpreferredname={user.qc_userpreferredname}
          qc_userphone={user.qc_userphone}
          qc_useraddress={user.qc_useraddress}
          qc_userzip={user.qc_userzip}
          qc_userstartdate={user.qc_userstartdate}
          qc_userroleid={user.qc_userroleid}
          qc_userenddate={user.qc_userenddate}
        ></User>
      );
    });
    return <tbody>{userNodes}</tbody>;
  },
});

var UserUpdateForm = React.createClass({
  getInitialState: function () {
    return {
      qc_upuserid: "",
      qc_upusername: "",
      qc_upuseremail: "",
      qc_upuserfname: "",
      qc_upuserlname: "",
      qc_upuserprefname: "",
      qc_upuserphone: "",
      qc_upuseraddress: "",
      qc_upuserzip: "",
      qc_upuserstartdate: "",
      qc_upuserroleid: "",
      qc_upuserenddate: "",
      updata: [],
    };
  },

  loadRoleTypes: function () {
    $.ajax({
      url: "/getroletypes",
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ updata: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  componentDidMount: function () {
    this.loadRoleTypes();
  },

  handleUpSubmit: function (e) {
    e.preventDefault();

    var qc_upuserid = qc_upid.value;
    var qc_upusername = qc_upname.value;
    var qc_upuseremail = qc_upemail.value;
    var qc_upuserfname = qc_upfname.value;
    var qc_upuserlname = qc_uplname.value;
    var qc_upuserprefname = qc_upprefname.value;
    var qc_upuserphone = qc_upphone.value;
    var qc_upuseraddress = qc_upaddress.value;
    var qc_upuserzip = qc_upzip.value;
    var qc_upuserstartdate = formatDateOnly(qc_upstartdate.value);
    var qc_upuserroleid = qc_uproleid.value;
    var qc_upuserenddate = formatDateOnly(qc_upenddate.value);

    this.props.onUpdateSubmit({
      qc_upid: qc_upuserid,
      qc_upname: qc_upusername,
      qc_upemail: qc_upuseremail,
      qc_upfname: qc_upuserfname,
      qc_uplname: qc_upuserlname,
      qc_upprefname: qc_upuserprefname,
      qc_upphone: qc_upuserphone,
      qc_upaddress: qc_upuseraddress,
      qc_upzip: qc_upuserzip,
      qc_upstartdate: qc_upuserstartdate,
      qc_uproleid: qc_upuserroleid,
      qc_upenddate: qc_upuserenddate,
    });
  },

  handleUpChange: function (event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  },

  render: function () {
    return (
      <div id="theform">
        <form onSubmit={this.handleUpSubmit}>
          <h2>Update User</h2>
          <table>
            <tbody>
              <tr>
                <th>Username</th>
                <td>
                  <input
                    type="text"
                    name="qc_upname"
                    id="qc_upname"
                    value={this.state.qc_upname}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td>
                  <input
                    type="text"
                    name="qc_upemail"
                    id="qc_upemail"
                    value={this.state.qc_upemail}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>First Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_upfname"
                    id="qc_upfname"
                    value={this.state.qc_upfname}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Last Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_uplname"
                    id="qc_uplname"
                    value={this.state.qc_uplname}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Preferred Name</th>
                <td>
                  <input
                    type="text"
                    name="qc_upprefname"
                    id="qc_upprefname"
                    value={this.state.qc_upprefname}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>
                  <input
                    type="text"
                    name="qc_upphone"
                    id="qc_upphone"
                    value={this.state.qc_upphone}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Address</th>
                <td>
                  <input
                    type="text"
                    name="qc_upaddress"
                    id="qc_upaddress"
                    value={this.state.qc_upaddress}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Zip</th>
                <td>
                  <input
                    type="text"
                    name="qc_upzip"
                    id="qc_upzip"
                    value={this.state.qc_upzip}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Start Date</th>
                <td>
                  <input
                    type="date"
                    name="qc_upstartdate"
                    id="qc_upstartdate"
                    value={this.state.qc_upstartdate}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
              <tr>
                <th>Role ID</th>
                <td>
                  <SelectUpdateList data={this.state.updata} />
                </td>
              </tr>
              <tr>
                <th>End Date</th>
                <td>
                  <input
                    type="date"
                    name="qc_upenddate"
                    id="qc_upenddate"
                    value={this.state.qc_upenddate}
                    onChange={this.handleUpChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <input type="hidden" name="qc_upid" id="qc_upid" />
          <input type="submit" value="Update User" />
        </form>
      </div>
    );
  },
});

var User = React.createClass({
  getInitialState: function () {
    return {
      qc_upuserkey: "",
      singledata: [],
    };
  },

  updateRecord: function (e) {
    e.preventDefault();
    var qc_theupuserkey = this.props.qc_userid;
    this.loadSingleUser(qc_theupuserkey);
  },

  loadSingleUser: function (qc_theupuserkey) {
    $.ajax({
      url: "/getsingleuser",
      data: { qc_upuserkey: qc_theupuserkey },
      dataType: "json",
      cache: false,
      success: function (data) {
        this.setState({ singledata: data });
        console.log(this.state.singledata);
        var populateUser = this.state.singledata.map(function (user) {
          qc_upid.value = qc_theupuserkey;
          qc_upname.value = user.qc_username;
          qc_upemail.value = user.qc_useremail;
          qc_upfname.value = user.qc_userfirstname;
          qc_uplname.value = user.qc_userlastname;
          qc_upprefname.value = user.qc_userpreferredname;
          qc_upphone.value = user.qc_userphone;
          qc_upaddress.value = user.qc_useraddress;
          qc_upzip.value = user.qc_userzip;
          qc_upstartdate.value = formatDateOnly(user.qc_userstartdate);
          qc_uproleid.value = user.qc_userroleid;
          qc_upenddate.value = formatDateOnly(user.qc_userenddate);
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  render: function () {
    return (
      <tr>
        <td>{this.props.qc_userkey}</td>
        <td>{this.props.qc_userid}</td>
        <td>{this.props.qc_username}</td>
        <td>{this.props.qc_useremail}</td>
        <td>{this.props.qc_userfirstname}</td>
        <td>{this.props.qc_userlastname}</td>
        <td>{this.props.qc_userpreferredname}</td>
        <td>{this.props.qc_userphone}</td>
        <td>{this.props.qc_useraddress}</td>
        <td>{this.props.qc_userzip}</td>
        <td>{formatDateOnly(this.props.qc_userstartdate)}</td>
        <td>{this.props.qc_userroleid}</td>
        <td>{formatDateOnly(this.props.qc_userenddate)}</td>
        <td>
          <form onSubmit={this.updateRecord}>
            <input type="submit" value="Select" />
          </form>
        </td>
      </tr>
    );
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

var SelectUpdateList = React.createClass({
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
        name="qc_uproleid"
        id="qc_uproleid"
        value={this.props.value}
        onChange={this.props.onChange}
      >
        <option value="">Select a Role</option>
        {optionNodes}
      </select>
    );
  },
});

ReactDOM.render(<UserBox />, document.getElementById("content"));
