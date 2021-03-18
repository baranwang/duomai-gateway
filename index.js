import express from 'express';
import crypto from 'crypto';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 8888;

const appKey = '440756';
const appSecret = 'def800f147fcbe2baf70b3f94399a684';
const siteId = '440759';

/**
 *
 * @param {string} service
 * @param {Record<string, any>} body
 * @returns {Promise<{ status: number; data: Record<string, any> }>}
 */
const DuomaiAPI = (service, body) => {
  const timestamp = Date.parse(new Date()) / 1000;

  const params = {
    app_key: appKey,
    service,
    timestamp,
  };
  const baseSign = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');

  const sign = crypto
    .createHash('md5')
    .update(`${appSecret}${baseSign}${JSON.stringify(body)}${appSecret}`)
    .digest('hex')
    .toUpperCase();

  return axios
    .post('https://open.duomai.com/apis', body, {
      params: { ...params, sign },
      headers: { 'Content-Type': 'application/json' },
    })
    .then(({ data }) => data)
    .catch((e) => ({ ...e.response.data, data: {} }));
};

app.get('*', async (req, res) => {
  const url = req.url.substr(1);
  if (!url) {
    return res.send('');
  }
  const {
    data: { ads },
    info,
  } = await DuomaiAPI('cps-mesh.cpslink.links.put', { url });
  if (!ads || !ads.length) {
    console.log(info);
    return res.redirect(url);
  }
  const { data } = await DuomaiAPI('cps-mesh.cpslink.links.post', {
    url,
    ads_id: ads[0].id,
    site_id: siteId,
  });
  if (!data.url) {
    return res.redirect(url);
  }
  res.redirect(data.url);
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
