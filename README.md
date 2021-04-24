<H1>Bookmarks Simplified</H1>
This chrome extension basically lets you view and manage your bookmarks in a new tab, just by button click.
There is now hasstle to go to settings => bookmarks in order to view or manage your bookmarks.
Just install the extenstion and all your bookmarks are a button click away.
Currently the extension has following in built features :
<ul>
   <l1>Displays all your saved bookmarks in a new tab.</li>
   <l1>Lets you View, Search and Delete bookmarks.</li>
   <l1>Automatically updates the view when you add or delete a bookmark in chrome.</li>
   <l1>Keeps your default new tab view as it is and only renders on a button click.</li>
</ul>

<H1>Stack</H1>
This is built with NextJs and React. It uses the static export of NextJs.
All the css has been custom desigined as per required.

<H1>Dev Mode</H1>
To run the extenstion in dev mode you need to comment out the chrome usgae in the component mount method.
Also add the test data and save it to the state.

<H1>How to deploy the extension</H1>
To deploy the extension on chrome, follow the steps :
<ul>
<li>Run the next build - npm run build</li>
<li>Run the next export - npm run export</li>
<li>Copy the manifest.josn and background.js file to the out folder created.</li>
<li>Rename the _next folder inside out directory to znext.</li>
<li>Find all the occurence of /_next folder in out directory and replace it with /znext.</li>
<li>Upload the out folder to chrome extensions.</li>



</ul>
