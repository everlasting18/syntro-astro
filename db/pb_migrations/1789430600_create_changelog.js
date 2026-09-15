/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "changelog",
    listRule: "published = true",
    viewRule: "published = true",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "title", type: "text", required: true, max: 200 },
      { name: "body", type: "editor" },
      { name: "tag", type: "text", max: 40 },
      { name: "published", type: "bool" },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
  })
  app.save(collection)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("changelog"))
})
