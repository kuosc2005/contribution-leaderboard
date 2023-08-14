import { Response, Request } from "express";
import { IPost, IPayload, IGetQuery } from "../interface";
import { Webhook } from "../models/webhooks.models";

export const post = async (req: Request<{}, {}, IPost>, res: Response) => {
  try {
    console.log(req.body);
    const payload: IPayload = JSON.parse(req.body.payload);
    if (payload.commits) {
      if (payload.commits.length === 1) {
        const webhook = await Webhook.create({
          type: "commit",
          username: payload.commits[0].author.username,
          userId: payload.commits[0].author.email.split("+")[0],
          repositoryId: payload.repository.id,
          repositoryName: payload.repository.full_name,
        });
        console.log(webhook);

        return res.json({
          success: true,
          data: webhook,
          message: "Success",
        });
      }
      if (payload.commits.length > 1) {
        let webhook: Array<any> = [];
        payload.commits.forEach(async (data, index) => {
          if (
            webhook.some((element) => element.username === data.author.username)
          ) {
            return;
          }
          webhook.push(
            await Webhook.create({
              type: "commit",
              username: data.author.username,
              userId: data.author.email.split("+")[0],
              repositoryId: payload.repository.id,
              repositoryName: payload.repository.full_name,
            })
          );
        });
        return res.json({
          success: true,
          data: webhook,
          message: "Success",
        });
      }
      return res.sendStatus(500);
    }
    if (payload.issue) {
      Webhook.create({
        username: payload.issue.user.login,
        userId: payload.issue.user.id,
        type: "issue",
        repositoryId: payload.repository.id,
        reposityoryName: payload.repository.full_name,
      });
    }
    res.send(req.body);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

export const get = async (
  req: Request<{}, {}, {}, IGetQuery>,
  res: Response
) => {
  try {
    const webhook = await Webhook.paginate(
      req.query.type
        ? {
            type: req.query.type,
          }
        : {},

      {
        limit: req.query.limit ? req.query.limit : 10,
        page: req.query.page ? req.query.page : 0,
      }
    );
    res.json({
      success: true,
      data: webhook,
      message: "Success",
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      err: err,
      message: "Internal Error",
    });
  }
};
