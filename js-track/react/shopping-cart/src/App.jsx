import Root from './components/Root';
import { CartProvider } from './components/CartContext';

function App() {
  return (
    <>
      <CartProvider>
        <Root />
      </CartProvider>
    </>
  );
}

export default App;
