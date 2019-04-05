import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Router from 'next/router';
import formatMoney from '../lib/formatMoney';
import { create } from 'domain';
import Error from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $description: String!
    $price: int!
    $image: String
    $largeImage: String
    $title: String!
    ) {
      createItem(
        title: $title
        descriptio: $descriptio
        price: $price
        image: $image
        largeImage: $largeImage
    ){
      id
    }
  }
`;

class CreateItem  extends Component {
  state = {
    title: 'Cool Shoes',
    description: 'I love those Context',
    image: 'dog.jpg',
    largeimage: 'large-dog.jpg',
    price: 1000,
  };
  handleChange = (e) => {
    const { name, type, value} = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };
  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
      {(createItem, {loading, error}) => (

      <Form
      onSubmit={async e => {
        //Stop the form from submitting
        e.preventDefault();
        //Call the mutation
        const res = await createItem();
        console.log(res);
        //Change them to the single item page
        Router.push({
          pathname: '/item',
          query: {id: res.data.createItem.id },
        });
      }}
      >
          <Error error={error}/>
          <fieldset disabled={loading} aria-busy={loading}>
            <label htmlFor="title">
              Title
              <input
              type="text"
              id="title"
              name="title"
              placeholder="Title"
              required value={this.state.title}
              onChange={this.handleChange}
              />
            </label>
            <label htmlFor="price">
              Price
              <input
              type="number"
              id="price"
              name="price"
              placeholder="Price "
              required
              value={this.state.price}
              onChange={this.handleChange}
              />
            </label>
            <label htmlFor="description">
              Description
              <textarea
              id="description"
              name="description"
              placeholder="Enter A Description"
              required
              value={this.state.description}
              onChange={this.handleChange}
              />
            </label>
          </fieldset>
          <button type="submit">Submit</button>
      </Form>
    )}
  </Mutation>
    );
  }
}

export default CreateItem ;
export { CREATE_ITEM_MUTATION };