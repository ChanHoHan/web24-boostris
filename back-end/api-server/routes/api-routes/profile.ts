import * as express from 'express';
import { selectTable, innerJoinTable, updateTable } from '../../database/query';
import { setJWT } from '../../services/auth';

const ProfileRouter = express.Router();

ProfileRouter.post('/stateMessage', async (req, res, next) => {
  try {
    const stateMessageList = await getStateMessageInDB(req.body.nickname);
    if (stateMessageList.length === 0) {
      //잘못된 경우 에러처리
      res.status(401).json({ error: '잘못된 인증입니다.' });
    } else {
      const { state_message } = stateMessageList[0];
      res.status(200).json({ state_message });
    }
  } catch (error) {
    res.status(401).json({ error: '잘못된 인증입니다.' });
  }
});

ProfileRouter.post('/total', async (req, res, next) => {
  try {
    const [{ oauth_id }] = await getOauthId(req.body.nickname);
    const totalList = await getTotalInDB(oauth_id);
    const [total, win] = totalList;
    const data = { ...total[0], ...win[0] };
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: '잘못된 인증입니다.' });
  }
});

ProfileRouter.post('/recent', async (req, res, next) => {
  try {
    const { nickname, offset, limit } = req.body;
    const [{ oauth_id }] = await getOauthId(nickname);
    const data = await getRecentInDB(oauth_id, offset, limit);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: '잘못된 인증입니다.' });
  }
});

ProfileRouter.patch('/', async (req, res, next) => {
  try {
    const { nickname, id } = req.body;
    const result = await updateProfileInDB(req.body);
    if (result.warningStatus !== 0) {
      res.status(401).json({ error: '잘못된 인증입니다.' });
    } else {
      res.clearCookie('user');
      setJWT(req, res, { nickname, oauth_id: id });
      res.status(200).json({ message: 'done' });
    }
  } catch (error) {
    res.status(401).json({ error: '잘못된 인증입니다.' });
  }
});

const getOauthId = (nickname) => {
  return selectTable('oauth_id', 'USER_INFO', `nickname='${nickname}'`);
};

const updateProfileInDB = ({ nickname, stateMessage, id }) => {
  return updateTable(
    'USER_INFO',
    `state_message='${stateMessage}', nickname='${nickname}'`,
    `oauth_id='${id}'`
  );
};

const getStateMessageInDB = (nickname) => {
  return selectTable('state_message', 'USER_INFO', `nickname='${nickname}'`);
};

const getTotalInDB = async (id) => {
  return await Promise.all([
    selectTable(
      'SUM(attack_cnt) as total_attack_cnt, COUNT(oauth_id) as total_game_cnt, SEC_TO_TIME(SUM(play_time)) as total_play_time ',
      'PLAY',
      `oauth_id='${id}'`
    ),
    innerJoinTable(
      `SUM(case when game_mode='normal' then player_win else 0 end) as multi_player_win`,
      'PLAY',
      'GAME_INFO',
      'PLAY.game_id = GAME_INFO.game_id',
      `oauth_id='${id}'`
    ),
  ]);
};

const getRecentInDB = (id, offset, limit) => {
  return innerJoinTable(
    'game_date, game_mode, ranking, SEC_TO_TIME(play_time) as play_time, attack_cnt, attacked_cnt',
    'PLAY',
    'GAME_INFO',
    'PLAY.game_id = GAME_INFO.game_id',
    `oauth_id='${id}'`,
    `game_date DESC`,
    `${offset}, ${limit}`
  );
};

export default ProfileRouter;
