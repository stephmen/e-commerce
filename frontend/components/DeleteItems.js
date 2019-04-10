import React, { Component } from "react";

class DeleteItems extends Component {
  render() {
    return <button>{this.props.children}</button>;
  }
}

export default DeleteItems;
