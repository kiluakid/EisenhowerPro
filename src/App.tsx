/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './AppContext';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
