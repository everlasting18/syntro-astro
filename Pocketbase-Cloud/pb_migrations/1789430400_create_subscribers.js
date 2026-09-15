/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "subscribers",
    listRule: null,
    viewRule: null,
    createRule: "",
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "email", type: "email", required: true },
      { name: "source", type: "text", max: 64 },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: ["CREATE UNIQUE INDEX `idx_subscribers_email` ON `subscribers` (`email`)"],
  })
  app.save(collection)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("subscribers"))
})
