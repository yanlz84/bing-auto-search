// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.46
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
var default_search_words = ["习近平同巴西总统卢拉共同会见记者", "中国日用品供应商心态变了", "夫妻俩制假币每天印多少花多少", "中拉去年贸易额超5184亿美元", "火车穿村致18死后又一老人被撞身亡", "特朗普突然提到“统一” 台当局急了", "网友发帖“避雷浪琴”：就剩表带", "西北大学回应副校长成陕西首富", "三部大剧同一天官宣", "英伟达市值一夜增超约1.2万亿元", "今日对美加征关税由34%调整为10%", "重庆一村天然气泄漏需全镇转移？假", "步行者vs骑士", "美国前财长：特朗普先让步尴尬但有用", "一法拍房遭疯抢 原房主是已故大毒枭", "10名干部学习期间违规吃喝 1人死亡", "美媒曝特朗普突然与胡塞停火原因", "杜淳妻子自曝当不了演员的原因", "美国和沙特签署上千亿美元军售协议", "为什么我们的衣服越来越难买了", "中美关税互降 美企紧急恢复发货操作", "北京白天超30℃ 为何晚间突降冰雹", "富士辟谣拍立得相纸停产", "肖战《藏海传》回眸镜头曝光", "男子称裸睡时遭酒店服务员闯入", "中企电话被美客户打爆：一船难求", "陈妍希和小8岁肖战演母子", "官方通报村民穿警察字样雨衣办丧事", "黄晓明金世佳博士复试还需加试笔试", "救护车拉警报旅游是对善良的背刺", "超一线女星神秘恋情将曝光", "张艺兴晒出与马东锡的合照", "女子用假文凭入职被发现后起诉索赔", "荷兰女排8月到深圳参加女排精英赛", "官方通报救护车拉警报开道旅游", "阿尔巴尼亚执政党在议会选举中获胜", "北京冰雹比鸭蛋还大", "网红“自杀”剧本消耗的是社会善意", "哪吒汽车被申请破产", "皇马公布对阵马略卡大名单", "英与欧盟国防基金谈判进入攻坚战", "《歌手2025》彩排路透", "外媒：曼联目前无意重新考虑帅位", "体系作战除了空空还有对地", "红旗E702项目平台车首车试制下线", "标普收复年内跌幅 特斯拉涨近5%", "经济日报：共享平台莫忘普惠初衷", "夏普：詹姆斯不会离开湖人", "美国4月小企业信心连续第四个月下滑", "贝弗利：哈登扛着球队进季后赛", "曝山西男篮单赛季冠名费近9500万元"]

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
