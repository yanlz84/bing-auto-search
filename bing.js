// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.178
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
var default_search_words = ["中央城市工作会议部署重点任务", "一台3万元 打工人养不起小电驴", "孙颖莎被印在了EMS录取通知书封面", "防中暑要避开这些误区", "爱泼斯坦案升温 特朗普起诉默多克", "媒体评暴走团逼停120和119：生命至上", "杨议：杨少华遗产4个亿是玩笑话", "男子超市买到207瓶假酒 获赔12万", "知名歌手甄妮坐飞机行李箱被盗", "男生送餐时得知被空军航空大学录取", "88.8万赔偿律师拿走55.5万 合理吗", "青海考生405分被北大录取？假的", "暴走团群主回应阻碍消防救护车通行", "胡塞称袭击以色列：百万人逃入避难所", "律师拿走55万赔款 律协让其退39万", "X玖少年团官宣解散", "“小马云”范小勤被围观的十年", "周渝民夫妇被闺蜜诈骗841万案宣判", "黄奕女儿想去韩国当练习生", "2岁患癌女童父亲回应动物园捐款", "GAI周延淘汰", "女子赤裸上半身检查时遭护士闯入", "73年历史的星级酒店摆摊卖卤味", "逼停120和119徒步团有近10年历史", "垃圾也没想到自己还有被争夺的一天", "田志希宣布怀孕", "两大国资争抢良品铺子", "15岁孩子夜游嘉陵江失踪 妈妈急哭", "加密币大涨24小时近16万人爆仓", "多方回应男子超市买五粮液多为假货", "牛弹琴：特朗普的最大麻烦来了", "中国空调拥有量地图：这省猛增10倍", "3名00后脑瘫少年摆摊卖大蒜", "龚文密落马：搞权权 权色 钱色交易", "高温来袭 以后夏天会越来越热吗", "女业务员住在车里实现上班零通勤", "开盘1万2现8千 开发商：不降价就等死", "跑步视频获超11万条留言的书记落马", "收费员拿公司2瓶洗手液被开除", "台风“韦帕”或以巅峰强度登陆广东", "美国制裁俄罗斯 喊疼的咋是印度", "外交部提醒出境游客切勿拍敏感场所", "家属称4名失联男孩定位显示在柬埔寨", "今年蚊子不是变少了只是热“懒”了", "《奇葩说》辩手颜如晶一年暴瘦60斤", "巴西对中国稀土出口量激增", "费翔收到全球限定款LABUBU", "男子躲女厕隔间偷拍被抓现行", "德国总理：加沙地带情况令人难以接受", "阿坝旅游车坠河案找到5名遇难者", "外交部再次提醒赴菲留学人员"]

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
