This project is based on [Hugo](https://gohugo.io/).

1. Install g: https://github.com/stefanmaric/g
2. Install Go: `g install latest`
3. Install Hugo: `go install -v github.com/gohugoio/hugo@latest`

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

## Project Notes

### Pages With Resources

A page, e.g. "blog post", that incudes things like images are written using
[Page Bundles](https://gohugo.io/content-management/page-bundles/). For example,
a post on 2022-05-08 titled "Foo Bar" that has an image to include would be
added to the project like so:

```
content
└── posts
    └── 2022
        └── 05
            └── 08
                └── foo-bar
                    ├── an-image.jpg
                    └── index.md
```
