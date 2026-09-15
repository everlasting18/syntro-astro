/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("changelog")
  const samples = [
    {
      title: "Sample: Changelog entries come from PocketBase",
      tag: "Feature",
      published: true,
      body: "<p>This is sample content. Edit or delete it in the PocketBase dashboard under the <strong>changelog</strong> collection — the page updates without a redeploy.</p>",
    },
    {
      title: "Sample: Newsletter and contact forms are live",
      tag: "Improvement",
      published: true,
      body: "<p>This is sample content. Sign-ups land in <strong>subscribers</strong> and messages in <strong>messages</strong>; only superusers can read them.</p>",
    },
  ]
  for (const sample of samples) {
    const record = new Record(collection)
    record.load(sample)
    app.save(record)
  }
}, (app) => {
  for (const record of app.findRecordsByFilter("changelog", "title ~ 'Sample:'", "", 0, 0)) {
    app.delete(record)
  }
})
