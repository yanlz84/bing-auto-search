// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.381
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["呵护好中华文明瑰宝 习近平这样嘱托", "大批轰-6K贴近台岛 专家解读", "佘诗曼：会照顾许绍雄家人", "超级工程变超级IP", "山姆“黄金大闸蟹”系水贝供货", "军机在南海坠毁后 美航母掉头返航", "被蛇咬失联男子友人：他嫌贵没打血清", "鲁迅长孙吊唁许绍雄：情谊始终珍藏", "李维嘉正式回归湖南卫视", "00后美术生毕业摆摊日入过千", "中国隐形涂层有了重大突破", "河南南阳雪降农田系谣言", "女子在单位值夜班离奇失踪35年", "安徽一野生动物园狮子遭老虎撕咬", "宝宝小嘴急得一直动 喊出第一声妈妈", "中通被约谈", "商丘一女子接触发霉玉米后肺部全白", "当地人曝KK园区附近园区照常运作", "香港名媛蔡天凤案进展：前婆婆获刑", "《甄嬛传》果郡王转战短剧赛道", "许绍雄一个月前逛街健步如飞", "儿子考10分被爸爸扔椅子砸破头", "男子直播挖蛇被咬 没打血清失联至今", "奶皮子糖葫芦卖到40元一串", "周大福、老凤祥等品牌下调金饰售价", "河南卫视重阳奇妙游", "辽宁一洗浴中心养企鹅揽客 当地回应", "许绍雄家人感谢大家关心", "被拐30年的梁志辉找到了", "张馨予穿25斤礼服被赞红毯定海神针", "11岁孩子为锻炼舌头吞下10克金豆", "秋冬的幸福感是奶皮子糖葫芦给的", "“十五五”规划建议发布", "央视揭秘原子弹组装过程", "重阳饮食少吃2肉多吃3菜", "受贿2675万余元！曹兴信一审获刑12年", "拉夫劳伦回应推出5390元木柴提袋", "广州一动物血库灰色产业被曝光", "许绍雄患癌仍敬业 今年参演9部作品", "许绍雄从未透露自己患癌", "学校收电话费校长等多人被立案审查", "中方回应美日重申要加强同盟关系", "中通快递回应被约谈", "演员许绍雄去世 曾饰演“欢喜哥”", "泽连斯基：愿在俄白之外任意地点谈判", "“十五五”这项任务排首位", "曝美掩盖半岛电视台女记者死亡真相", "肉联公司门口堆满死猪 7人被控制", "交通银行原副行长侯维栋被查", "越野车海滩撒欢被困 海水冲进车内", "肯尼亚一飞机失事 机上12人死亡"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
