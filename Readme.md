This project is based on [Hugo](https://gohugo.io/).

1. Install gvm: https://github.com/moovweb/gvm
2. Install Go: `gvm install go1.13 -B`
3. Install Hugo: `go get -v github.com/gohugoio/hugo`
    * Or to update: `go get -u all`

To view the site while writing: `hugo server -D`
To build the site into the `public` directory: `hugo`

The theme used is [Kiera](https://themes.gohugo.io/hugo-kiera/). Kiera supports
inlining images with the following syntaxes:

> `![Image Title](link/to/image)`
>
> to wrap it with figure use:
>
> `{{< figure src="/link/to/image" >}}`
>
> The basic placement is 100% width within content and scaled accordingly in
> smaller screen. Recommended width for image is 600 pixels minimum.
>
> Kiera supports different placement by adding:
>
> For img, use `![Image Title](link/to/image#placement)`
> For figure, use `{{< figure src="/link/to/image" class="placement" >}}`
> There are 4 configured placements
>
> + `#full` or `class="full"` for full width.
> + `#mid` or `class="mid"` for middle.
> + `#float` or `class="float"` for float left.
> + `#float-right` or `class="float-right"` for float right.
