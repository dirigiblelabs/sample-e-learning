# Sample - e-Learning

[![Eclipse License](http://img.shields.io/badge/license-Eclipse-brightgreen.svg)](LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/dirigiblelabs/sample-e-learning.svg)](https://github.com/dirigiblelabs/sample-e-learning/graphs/contributors)
[![Run on Dirigible](https://img.shields.io/badge/run%20on-dirigible-blue.svg)](http://trial.dirigible.io/services/v4/web/ide-deploy-manager/?repository=https://github.com/dirigiblelabs/sample-e-learning.git&uri=/services/v4/web/e-learning/)

## Overview

Sample e-Learning Application

## Setup

1. Setup Dirigible instance or use the trial one
    - https://www.dirigible.io/help/setup.html
    - https://www.dirigible.io -> `Try it Out`
    - or click on the ![Run on Dirigible](https://img.shields.io/badge/run%20on-dirigible-blue.svg) button
1. Clone the `Sample e-Learning` repository into your Dirigible instance:
    - Switch to the `Git` perspective
    - Click on the `+` button to clone Git repository
    - Set the `URL` to https://github.com/dirigiblelabs/sample-e-learning.git
    - Click the `Clone` button

    ![sample-crm-git-clone](https://github.com/dirigiblelabs/samples-docs/blob/master/sample-crm/docs/1-sample-crm-git-clone.gif)

## Tips & Tricks

In some cases, when updating the Entity Domain Model (model.edm), incompatible changes may occur. To resolve these issues, here are some Tips & Tricks about it:

1. Delete the generated files:
   - Delete all files under the "e-learning" project except `model.edm`, `model.model` and `project.json`
1. Unpublish the `e-learning` project
1. Re-generated the application from the updated `model.model`
1. Publish the `e-learning` project

![sample-crm-tips-and-tricks-1](https://github.com/dirigiblelabs/samples-docs/blob/master/sample-crm/docs/5-sample-crm-tips-and-tricks-1.gif)

In most cases, the previous steps should be enough to resolve issues from an incompatible change in the model. However, if incompatible change in the `Data` layer is made (e.g. `Null` -> `Not Null`, `VARCHAR` -> `INTEGER`, ...) then one addition step should be executed first:

1. Go to the `Database` perspective
1. Find the database table(s), to which incompatible changes were made
1. Right click on it
1. Select `Drop Table` from the menu

Otherwise execute SQL queries, to drop the table(s), from the `SQL` view:

```sql
drop table STUDENTS
```

![sample-crm-tips-and-tricks-2](https://github.com/dirigiblelabs/samples-docs/blob/master/sample-crm/docs/6-sample-crm-tips-and-tricks-2.gif)

In some cases the generated application view(s) may disappear or be closed by accident. To reset the default layout follow these steps:

1. Click on the "Themese" menu
1. Select the "Reset" option

![sample-crm-tips-and-tricks-3](https://github.com/dirigiblelabs/samples-docs/blob/master/sample-crm/docs/7-sample-crm-tips-and-tricks-3.gif)

## License

This project is copyrighted by [SAP SE](http://www.sap.com/) and is available under the [Eclipse Public License v 2.0](https://www.eclipse.org/legal/epl-v20.html). See [LICENSE](LICENSE) and [NOTICE.txt](NOTICE.txt) for further details.
