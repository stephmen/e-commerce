import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Item extends Component {
    static prototype = {
    Item: PropTypes.shape({
      title: PropTypes.string.isRequired,
      price: PropTypes.price.isRequired,
      
    })
  };
  render() {
    return  <div />;
  }
}