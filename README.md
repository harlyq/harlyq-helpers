# harlyq-helpers

A collection of utility functions, with an emphasis on ESM compatible pure functions which support tree-shaking and minimizing allocations.  Where possible the functions access the properties directly rather than via class specific methods, so the **vecxyz** helpers work with a THREE.Vector3() or a CANNON.Vec3() or an object with {x,y,z} properties.

To use:

`npm install git+https://git@github.com/harlyq/harlyq-helpers.git`

then access the relative module via:

```javascript
import { vecxyz } from "harlyq-helpers"

let vec = {}
vecxyz.set(vec, 2, 3, 4)
```
