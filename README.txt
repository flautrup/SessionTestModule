SessionTestModule

Description:
Prof of concept implementation of the Session Module API that implements persistant storage of sessions using files

Installation:
1. Install nodejs found at http://nodejs.org/
2. Dowload the SessionTestModule repository
3. From the command prompt go to the directory where you stored the content
4. Run npm install
5. Go to QMC and export certificate for host that SessionTestModule is running on with password test
6. Copy certificates from C:\ProgramData\Qlik\Sense\Repository\Exported Certificates\[host] to the directory where you host the SessionTestModule
7. From the directory where you host SessionTestModule run "node SessionTestModule.js"
8. Add a virtual proxy to the proxy with prefix "custom", Session module redirect URI "https://[server]:8188, Session cookie header name to "X-Qlik-Session-custom" and press OK and then Save.
9. Access the platform on https://[QV proxy server]/custom/hub or https://[QV proxy server]/custom/qmc and you will be using the new session module

To se if it works sessions should be stored as JSON files in the session directory.