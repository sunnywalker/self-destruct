# self-destruct

Vanilla JavaScript web component that makes web content self-destruct, meaning it removes itself from the DOM. It has no dependencies.

It can be used to easily implement timers, alerts, toasts, and other temporary content.

## Features

- Fades out just before being removed
- Honors the browser’s reduced motion preference to disable fade animation, or explicitly disable the animation
- Ability to specify the TTL (time to live). 5 seconds is the default.
- Optionally shows a progress indicator of the countdown (seconds, pie chart, bar)
- On hover and on click event interactivity
- Light DOM so its elements can be styled with CSS
- Progressive enhancement, so the content simply won’t self-destruct if the custom element fails to load

## Usage

Import the custom element and wrap your content to destroy.

```html
<script type="module" src="SelfDestruct.js"></script>

<!-- wrap password inputs in custom element -->
<self-destruct>
  <p>This message will self-destruct in 5 seconds.</p>
</self-destruct>

<!-- add optional attributes to the custom element -->
<self-destruct ttl="12.5s" progress="pie">
  <p>This message will self-destruct in 12½ seconds. <button type="button" class="self-destruct">Close now</button>
</self-destruct>
```

## Options

| Attribute name | Type | Behavior |
|----------------|------|----------|
| `no-animation` | n/a | Add this attribute to disable fade animation regardless of reduced motion preference |
| `on-click` | String | Specify the behavior of when the main element is clicked. See Interactivity below. |
| `on-hover` | String | Specify the behavior of when the main element is hovered over. See Interactivity below. |
| `progress` | String | Name of the timeout animation, if any. Valid options are: `bar`, `pie`, `seconds`. |
| `progress-target` | String | Use this selector (within the scope of the main element) to place the progress indicator instead of adding its own |
| `ttl` | String or Int | Time to live in milliseconds, or use #s or #ms. E.g., .2s = 0.2s = 200ms = 200 |

Note: progress indicators do not show up when the initial TTL is less than 1 second.

## Interactivity

Both `on-click` and `on-hover` can specify what happens when the the main element is clicked or hovered via the mouse respectively.

| Value | Behavior |
|-------|----------|
| `pause` | Pauses the countdown timer. For `on-click`, tapping the element again will resume the countdown. For `on-hover`, the countdown will only resume when then mouse leaves the main element. |
| `prevent` | Prevents the self-destruct from happening. |
| `reset` | Resets the countdown timer to the initial TTL value. With `on-hover`, the countdown will only resume when the mouse leaves the main element. |

Note: the element will always look for a `click` event on anything within it that has a `.self-destruct` class and will immediately trigger the self-destruct upon such a click.

## Styling

- `.self-destruct-progress` targets the timeout progress indicator
- `.self-destruct-progress-bar` targets the timeout bar
- `.self-destruct-svg` targets the timeout pie chart
- `.self-destruct-svg-bg` targets the background of the pie chart
- `.self-destruct-svg-bg` targets the foreground slice of the pie chart (note there is no slice when the min length is met)

## License

GNU LGPL 3.0
