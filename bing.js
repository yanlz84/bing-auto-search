// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.215
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
var default_search_words = ["筑牢强国建设民族复兴文化根基", "中方回应“中国雇佣兵参与俄乌战斗”", "25岁中国翼装飞行者撞岩壁身亡", "接触10秒即可感染 汛期当心这种病", "江西：解散不必要工作群1.9万余个", "中国汽车第一省易主", "净网：网警查处编造中考分数线谣言者", "温州7岁男孩补课期间从14楼坠亡", "《行尸走肉》女演员去世 年仅33岁", "医生强奸未成年 检察官父亲任辩护人", "白举纲空降贴吧聊《歌手2025》幕后", "明日立秋 换季常见谣言别再信了", "薛家燕回应“被小17岁男友骗2亿”", "陶白白官宣离婚", "父亲胃癌术后3月 女儿也查出胃癌", "公司为缩减成本要求女员工50岁退休", "黄崖洞保卫战 创敌我伤亡6:1纪录", "一个人逛景德镇有多治愈", "赵露思称不在乎代言会掉", "樊振东回应张继科分享好苗子", "是谁在“逼疯”赵露思", "平头哥回应全名被警方“公开”", "逆行插队车被交警逼退1公里", "浙江一70后副厅长在贵州因病去世", "房主任哽咽呼吁大家不要买黄牛票", "女子去猫咖包房虐猫致4只猫死伤", "巴西44岁CEO跳伞发生空中撞击坠亡", "海底捞回应“改为半自助模式”", "张若昀父亲被恢复执行3.5亿", "经历72小时暴雨后广东情况如何", "张译获国家一级演员职称", "浙大坠楼博导后事时间未确定", "女子遛弯捡了20斤海螺装6个盆", "入境美国或需缴纳1.5万美元保证金", "江苏首富之子拟任400亿市值公司董事", "全球最大船企来了", "小车行驶中突遭闪电击中", "台积电2nm工艺突然泄密", "普京会见美国总统特使", "孩子后退时不小心摔进热锅", "国家电网用电负荷连续三天创新高", "方媛挺孕肚与郭富城庆生", "驻马店农户：四十多年没见过这么旱", "男子盗女生合照问彩礼10万选谁 判了", "网红刘大悦自曝患甲状腺癌", "秦如培受贿2.16亿余元一审被判死缓", "男子猛踹电梯面板后逃窜 物业回应", "今年第10号台风“白鹿”停止编号", "饶舌歌手或因吃下七颗榴莲导致中风", "游戏女主播与头像不符被骂 本人回应", "福建舰入列“攻坚” 岛内高度关注"]

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
