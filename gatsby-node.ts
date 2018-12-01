import { getPhotoSet, Photo } from "@mattb/flickr-api";
import createNodeHelpers from "gatsby-node-helpers";

const { createNodeFactory } = createNodeHelpers({
  typePrefix: `Flickr`
});

const FlickrSetNode = createNodeFactory(`Set`);

export async function onCreateNode({ node, actions, cache, reporter }: any) {
  const { createNode, createParentChildLink } = actions;
  if (!process.env.FLICKR_API_KEY) {
    return;
  }
  if (!node.frontmatter || !node.frontmatter.flickrSet) {
    return;
  }
  const setId = node.frontmatter.flickrSet;
  let photos: Array<Photo> | null = null;
  try {
    const cacheKey = `flickr-set-${setId}`;
    photos = await cache.get(cacheKey);
    if (!photos) {
      photos = await getPhotoSet(process.env.FLICKR_API_KEY, setId);
      cache.set(cacheKey, photos);
    }
  } catch (err) {
    reporter.panicOnBuild(
      `Error fetching FlickrSet ${node.fromatter.flickrSet} for node ${
        node.id
      }\n${err}`
    );
  }
  if (!photos) {
    return;
  }
  const flickrNode = FlickrSetNode(
    {
      id: setId,
      photos
    },
    {
      parent: node.id
    }
  );
  createNode(flickrNode);
  createParentChildLink({ parent: node, child: flickrNode });
}
