// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.454
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
var default_search_words = ["总书记关爱残疾人的暖心故事", "马克龙抵京后发文", "高市早苗盯上中亚5国", "中国大市场韧性强活力足", "10万人赶曹洼大集 到底在“赶”什么", "美军一F16战机坠毁 腾起巨大火球", "24人骗取生育津贴超220万元", "天津一博士满屋藏书惊呆网友", "电动车新国标戳中3.8亿人的出行痛点", "再多“万能血浆”也救不了日本", "日本又有新动作：整编航空宇宙自卫队", "四川绵阳发生山体火灾系谣言", "外卖小哥的竞争对手来了", "妻子为娃花15800后 丈夫坦白已离职", "胖东来小方糖戒指热卖 1克拉169元", "考编第1名却因学历重叠政审不合格", "江苏爸妈生出混血娃娃", "老人要求让爱心专座 女生：我也很累", "金建希出庭受审：被人搀扶头发花白", "小米辣涨到28元1斤 市民：顶两斤肉", "骑电动车还能带孩子吗？解读来了", "小区保安一棍打死业主3个月大幼犬", "王毅会见法国外长 介绍高市言论本质", "重庆一轿车违规掉头撞上装甲车", "工行存100万与存20万利率相同", "台湾小学校歌唱中国人让绿营破防", "蔡磊已准备好尝试脑机接口", "花大价钱设盲道 普通人路过也摔跤", "外交部批评英方：没有任何道理", "俄一载400余人客机起飞后引擎起火", "正直播NBA：开拓者vs骑士", "人民币升值 创近一年新高", "甘肃武威有牧民在河谷拍到马麝", "访华之旅能成马克龙“救命稻草”吗", "中俄进行战略对表 高市还敢搞事吗", "日学者：中国游客不来才是日存亡危机", "浙江宣传：吸毒记录封存之忧要被听见", "四川：鼓励安排教师实行弹性上下班制", "6瓶黄豆酱竟被武汉厦门警方盯上", "乡卫生院9元奥司他韦售价86被质疑", "男子持刀伤人致1死 武汉警方通报", "苑举正称中国人不是好欺负的", "冷藏酸奶渗出水是坏了吗", "今年最后一次“超级月亮”", "女子取环后子宫穿孔称主刀医生被换", "倡议村民自觉停用土炕 不能一封了之", "中新网评“109人炒股群108个托”", "上班后变胖？医生：大脑认为你受虐待", "阎王爷成“解压神” 横店NPC们爆火", "荒野求生林北退赛 获得2000元奖金", "秘鲁总统候选人遇袭 与枪手对射"]

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
