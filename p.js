const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_HISTORY_LENGTH = 20;
const VALID_OPERATORS = ['plus', 'minus', 'into', 'by', 'add', 'subtract', 'multiply', 'divide', 'power', 'modulus', 'sqrt', 'negate'];

let history = [];

app.use(bodyParser.json());

// Middleware to validate and parse mathematical operations from URL
app.param('params', (req, res, next, params) => {
  const operationParams = params.split('/');
  
  if (!validateOperationParams(operationParams)) {
    return res.status(400).json({ error: 'Invalid operation parameters' });
  }

  req.operationParams = operationParams;
  next();
});

// Validate the mathematical operation parameters
function validateOperationParams(params) {
  if (params.length < 3 || params.length % 2 !== 1) {
    return false;
  }

  const validOperators = VALID_OPERATORS.concat(VALID_OPERATORS.map(op => op.charAt(0).toUpperCase() + op.slice(1)));

  for (let i = 1; i < params.length; i += 2) {
    if (isNaN(parseFloat(params[i])) || !validOperators.includes(params[i - 1])) {
      return false;
    }
  }

  return true;
}

// Helper function to perform mathematical operations
function performOperation(params) {
  let result = parseFloat(params[0]);

  for (let i = 1; i < params.length; i += 2) {
    const operator = params[i - 1];
    const operand = parseFloat(params[i]);

    switch (operator) {
      case 'plus':
      case 'add':
        result += operand;
        break;
      case 'minus':
      case 'subtract':
        result -= operand;
        break;
      case 'into':
      case 'multiply':
        result *= operand;
        break;
      case 'by':
      case 'divide':
        result /= operand;
        break;
      case 'power':
        result **= operand;
        break;
      case 'modulus':
        result %= operand;
        break;
      case 'sqrt':
        result = Math.sqrt(result);
        break;
      case 'negate':
        result = -result;
        break;
    }
  }

  return result;
}

// Endpoint to perform and record mathematical operations
app.get('/:params', (req, res) => {
  const question = req.operationParams.join(' ');
  const answer = performOperation(req.operationParams);
  const operation = { question, answer };

  history.unshift(operation);
  if (history.length > MAX_HISTORY_LENGTH) {
    history.pop();
  }

  res.json(operation);
});

// Endpoint to get history
app.get('/history', (req, res) => {
  res.json(history);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});