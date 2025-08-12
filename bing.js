// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.227
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
var default_search_words = ["大漠绘丹青", "9.3阅兵彩排官宣画面 仪仗队换装191", "你的快递费 开始贵了", "雨天出行怎样“避雷”", "离婚后妈妈给女儿改名“琉璃若水”", "女大学生拒绝搭讪被男子杀害", "女子带4个娃坐高铁被要求补3张票", "中国恒大将取消上市地位", "湖北一地二孩最高补贴28万三孩35万", "女孩称考上大学父母嫌远不给路费", "iPhone 17 Pro长得像充电宝", "特斯拉司机持刀伤人？男子造谣被拘", "警方通报男子景区刺死女大学生", "涉嫌严重违纪违法 屈玲妮被查", "“9月1日社保新规”的澄清与解读", "《浪浪山》宣发被抵制", "王晶谈梅艳芳赵文卓分手原因", "家长网上发视频质疑校服质量被拘留", "外交部回应特朗普希望中国多买大豆", "没吃到鸡蛋被抱怨的妻子患重度抑郁", "外卖员送错餐要求开门被拒后摔餐", "郭德纲：德云社早晚都是郭麒麟的", "大妈火车站逆行被绊倒身亡 家属索赔", "女歌手患癌去世 曾任《星光大道》评委", "实拍北京暴雨：天瞬间变黑 树枝狂摇", "直击北京降雨", "中方回应中美将关税休战期延长90天", "苹果曝六面玻璃iPhone专利", "个人单笔5万元以下消费可享贴息", "失踪男孩夏令营内均为自闭症儿童", "南昌景区持剪刀伤人男子有精神病史", "贝克汉姆夫妇未出席大儿子婚礼", "全球首款女团机器人10580元拍出", "官员用政府服务器挖价值1.5亿比特币", "浪浪山小妖怪能吃吗？央视解读", "#婚内强迫性行为是否构成强奸罪#", "00后女生90天减重40斤 公司奖2万", "420斤男孩瘦20斤姥姥心疼拒绝治疗", "自闭症男童走失超72小时 多方搜救", "湖南张家界现天门吐雾景观", "女子为逃刑罚“以孕避刑”", "辽宁抚顺一客车侧翻致4人死亡", "个人消费贷款财政贴息政策方案来了", "张静初研究生毕业", "珠海登山失联男子已不幸遇难", "重庆一爱心冰柜遭哄抢", "胡乔木之子胡石英逝世 享年81岁", "高考数学143分独臂少年考上公务员", "父亲给儿女喂农药致死案将开庭", "内蒙古“阴阳菜单”火锅店被罚", "姚晨为大理失联男孩发声"]

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
