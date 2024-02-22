import FamilyTree from "./components/FamilyTree";
import { FamilyProvider } from "./context/FamilyContext";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";

const supabase = createClient(
  'https://xawsywucexhrzfogqqrx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhd3N5d3VjZXhocnpmb2dxcXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIxNzg1NjAsImV4cCI6MjAwNzc1NDU2MH0.Da0jmbflAzIiIK50DeQQNeJoeLpWdLnTUQFV-Xew2Wg'
 );

function App() {
  const [session, setSession] = useState(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!session) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="auth_form">
          <Auth 
            supabaseClient={supabase}
            providers={["google", "discord", "github"]}
            appearance={{
              extend: false,
              className: {
                anchor: 'auth_anchor',
                button: 'auth_button',
                label: 'auth_label',
                input: 'auth_input',
                container: 'auth_container'
              },
            }}    
          />
        </div>

      </div>
    );
  } else {
    return (
      <FamilyProvider>
        <FamilyTree/>
      </FamilyProvider>
    );
  }
}

export default App;
