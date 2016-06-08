# Angular2-UUIID

Type definitions for UUID.js v3.3.0

Project: https://github.com/LiosK/UUID.js

Definitions by: Jason Jarrett <https://github.com/staxmanade/>

Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

# Use
```
import {UUID} from "uuid";
...
let uuid1 = UUID.generate() // get UUID string e.g. 22e08b89-0172-42f4-bbf7-265f0b2184b9
let uuid2 = UUID.generate() // get UUID string e.g. 9a27dd3a-ba5e-4e92-9559-a08cbd1eb1ba
let uuid3 = UUID.parse("22e08b89-0172-42f4-bbf7-265f0b2184b9")//Converts hexadecimal UUID string to an UUID object
uuid1.equals(uuid1) //return true
uuid1.equals(uuid3) //return true
uuid1.equals(uuid2) //return false
```
