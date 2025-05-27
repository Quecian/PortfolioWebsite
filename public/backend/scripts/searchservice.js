"use strict";

var usruser = 0;

var ServiceBox = React.createClass({
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
          this.loadServicesFromServer();
        }
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },

  loadServicesFromServer: function () {
      $.ajax({
          url: "/getservice", // Updated endpoint for services
          data: {
              "qc_servicename": qc_servicename.value,
              "qc_servicelength": qc_servicelength.value,
              "qc_servicetype": qc_servicetype.value,
              "qc_servicenote": qc_servicenote.value,
              "qc_servicecost": qc_servicecost.value,
          },
          dataType: "json",
          cache: false,
          success: function (data) {
              this.setState({ data: data });
          }.bind(this),
          error: function (xhr, status, err) {
              console.error("/getservice", status, err.toString());
          }.bind(this),
      });
  },

  componentDidMount: function () {
      this.loadAllowLogin();
      this.loadServicesFromServer();
  },

  handleChange: function (event) {
      this.setState({
          [event.target.id]: event.target.value,
      });
  },

  render: function () {
    if (this.state.viewthepage === 0) {
        return (
            <div>You do not have access to this page.</div>
        );
    } else {
        return (
          <div className="ServiceBox">
              <h1>Services</h1>
              <ServiceForm onServiceSubmit={this.loadServicesFromServer} />
              <br />
              <table>
                  <thead>
                      <tr>
                          <th>Service ID</th>
                          <th>Service Name</th>
                          <th>Service Length</th>
                          <th>Service Type</th>
                          <th>Service Notes</th>
                          <th>Service Cost</th>
                      </tr>
                  </thead>
                  <ServiceList data={this.state.data} />
              </table>
          </div>
      );
  }},
});

var ServiceForm = React.createClass({
  getInitialState: function () {
      return {
          qc_servicename: "",
          qc_servicelength: "",
          qc_servicetype: "",
          qc_servicenote: "",
          qc_servicecost: "",
      };
  },

  handleSubmit: function (e) {
      e.preventDefault();

      var qc_servicename = this.state.qc_servicename.trim();
      var qc_servicelength = this.state.qc_servicelength;
      var qc_servicetype = this.state.qc_servicetype;
      var qc_servicenote = this.state.qc_servicenote.trim();
      var qc_servicecost = this.state.qc_servicecost;

      this.props.onServiceSubmit({
          qc_servicename: qc_servicename,
          qc_servicelength: qc_servicelength,
          qc_servicetype: qc_servicetype,
          qc_servicenote: qc_servicenote,
          qc_servicecost: qc_servicecost,
      });
  },

  handleChange: function (event) {
      this.setState({
          [event.target.id]: event.target.value,
      });
  },

  render: function () {
      return (
          <form className="serviceForm" onSubmit={this.handleSubmit}>
              <h2>Search Services</h2>
              <table>
                  <tbody>
                      <tr>
                          <th>Service Name</th>
                          <td>
                              <input
                                  type="text"
                                  name="qc_servicename"
                                  id="qc_servicename"
                                  value={this.state.qc_servicename}
                                  onChange={this.handleChange}
                              />
                          </td>
                      </tr>
                      <tr>
                          <th>Service Length</th>
                          <td>
                              <input
                                  type="number"
                                  step="0.25"
                                  name="qc_servicelength"
                                  id="qc_servicelength"
                                  value={this.state.qc_servicelength}
                                  onChange={this.handleChange}
                              />
                          </td>
                      </tr>
                      <tr>
                          <th>Service Type</th>
                          <td>
                              <select
                                  name="qc_servicetype"
                                  id="qc_servicetype"
                                  value={this.state.qc_servicetype}
                                  onChange={this.handleChange}
                              >
                                  <option value="">Filter Services</option>
                                  <option value="General">General</option>
                                  <option value="Hair">Hair</option>
                                  <option value="Nail">Nails</option>
                                  <option value="Face">Facials</option>
                              </select>
                          </td>
                      </tr>
                      <tr>
                          <th>Service Notes</th>
                          <td>
                              <textarea
                                  name="qc_servicenote"
                                  id="qc_servicenote"
                                  value={this.state.qc_servicenote}
                                  onChange={this.handleChange}
                              />
                          </td>
                      </tr>
                      <tr>
                          <th>Service Cost</th>
                          <td>
                              <input
                                  type="number"
                                  step="0.01"
                                  name="qc_servicecost"
                                  id="qc_servicecost"
                                  value={this.state.qc_servicecost}
                                  onChange={this.handleChange}
                              />
                          </td>
                      </tr>
                  </tbody>
              </table>
              <input type="submit" value="Search Service" />
          </form>
      );
  },
});

var ServiceList = React.createClass({
  render: function () {
      var serviceNodes = this.props.data.map(function (service) {
          return (
              <Service
                  key={service.qc_serviceid}
                  qc_serviceid={service.qc_serviceid}
                  qc_servicename={service.qc_servicename}
                  qc_servicelength={service.qc_servicelength}
                  qc_servicetype={service.qc_servicetype}
                  qc_servicenote={service.qc_servicenotes}
                  qc_servicecost={service.qc_servicecost}
              />
          );
      });

      return <tbody>{serviceNodes}</tbody>;
  },
});

var Service = React.createClass({
  render: function () {
      return (
          <tr>
              <td>{this.props.qc_serviceid}</td>
              <td>{this.props.qc_servicename}</td>
              <td>{this.props.qc_servicelength}</td>
              <td>{this.props.qc_servicetype}</td>
              <td>{this.props.qc_servicenote}</td>
              <td>{this.props.qc_servicecost}</td>
          </tr>
      );
  },
});

ReactDOM.render(<ServiceBox />, document.getElementById("content"));