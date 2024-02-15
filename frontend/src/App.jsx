import FamilyTree from "./components/FamilyTree";
import { FamilyProvider } from "./context/FamilyContext";

function App() {
  return (
    <FamilyProvider>
      <FamilyTree/>
    </FamilyProvider>
  );
}

export default App;
