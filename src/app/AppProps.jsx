import PropTypes from 'prop-types';

export class AppProps {

   static optionalArray = typeof PropTypes.array;
   static optionalBool = typeof PropTypes.bool;
   static optionalFunc = typeof PropTypes.func;
   static optionalNumber = typeof PropTypes.number;
   static optionalObject = typeof PropTypes.object;
   static optionalString = typeof PropTypes.string;

   // optionalSymbol: PropTypes.symbol,
   //
   // // Anything that can be rendered: numbers, strings, elements or an array
   // // (or fragment) containing these types.
   // optionalNode: PropTypes.node,
   //
   // // A React element.
   // optionalElement: PropTypes.element,
   //
   // // A React element type (ie. MyComponent).
   // optionalElementType: PropTypes.elementType,
   //
   // // You can also declare that a prop is an instance of a class. This uses
   // // JS's instanceof operator.
   // optionalMessage: PropTypes.instanceOf(Message),
   //
   // // You can ensure that your prop is limited to specific values by treating
   // // it as an enum.
   // optionalEnum: PropTypes.oneOf(['News', 'Photos']),
   //
   // // An object that could be one of many types
   // optionalUnion: PropTypes.oneOfType([
   //    PropTypes.string,
   //    PropTypes.number,
   //    PropTypes.instanceOf(Message)
   // ]),
   //
   // // An array of a certain type
   // optionalArrayOf: PropTypes.arrayOf(PropTypes.number),
   //
   // // An object with property values of a certain type
   // optionalObjectOf: PropTypes.objectOf(PropTypes.number),
   //
   // // An object taking on a particular shape
   // optionalObjectWithShape: PropTypes.shape({
   //    color: PropTypes.string,
   //    fontSize: PropTypes.number
   // }),
   //
   // // An object with warnings on extra properties
   // optionalObjectWithStrictShape: PropTypes.exact({
   //    name: PropTypes.string,
   //    quantity: PropTypes.number
   // }),
   //
   // // You can chain any of the above with `isRequired` to make sure a warning
   // // is shown if the prop isn't provided.
   // requiredFunc: PropTypes.func.isRequired,
   //
   // // A required value of any data type
   // requiredAny: PropTypes.any.isRequired,

};

export default AppProps;
