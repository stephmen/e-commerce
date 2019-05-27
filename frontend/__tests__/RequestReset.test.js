import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import RequestReset, { REQUEST_RESET_MUTATION } from '../components/RequestReset';

const moks = [
    {
      request: {
        query: REQUEST_RESET_MUTATION,
        variables: { email: 'stephmen@gmail.com'}
      },
      results: {
        data: { requestReset: {message: 'success', __typename: 'Message'}}
      }
    },
];
group
describe(<RequestReset />', () => {
  it('renders and matches snapshot', async() => {
    const wrapper =  mount(<MockedProvider>
      <RequestReset />
    </MockedProvider>)
  })
});