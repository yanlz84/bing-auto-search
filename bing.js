// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.296
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
var default_search_words = ["纵深推进全国统一大市场建设", "大风+暴雨要来了！这些地区注意防范", "今日起 常温纯牛奶中禁止添加复原乳", "筑牢网络安全“防火墙”", "中美就TikTok问题达成基本框架共识", "红旗-22导弹现身塞尔维亚阅兵彩排", "浙江小伙二次入伍 女友含泪送别", "特朗普称去年3亿人死于毒品惊呆网友", "王毅抵达波兰：要保障中欧班列畅通", "动辄三四十元 为何路边摊越来越贵", "特朗普下令 国民警卫队将进驻孟菲斯", "涉郑州汛情雨情 这些谣言别信", "中美经贸马德里谈判最新结果公布", "深圳市民捡到2267.83克巨型金条", "现货黄金价格创历史新高", "以军夜间大规模空袭加沙城", "男子吃馒头噎死经调解获赔2.8万", "电闪雷鸣！成都凌晨突降大暴雨", "收到这种“银行卡”请立即剪碎", "英国战机将在波兰上空执行防空任务", "12岁女孩被继母生父虐死案二审开庭", "东风上汽理想比亚迪小米等 集体表态", "《赴山海》惊现台词本 成毅被指不敬业", "廉航旅客为省钱穿成“人体集装箱”", "这个“中国间谍”闹剧终于结束了", "19岁陈圆将13秒39惊艳全场", "朝鲜强硬发声：核大国地位不可逆转", "牙齿文身风靡齿科：牙冠刻印“发财”", "河南一石牌坊突然倒塌巨大石柱倒地", "退休老师成了学校争抢的香饽饽", "深圳七娘山失联男子遗体已找到", "外交部：美国让南海不得安宁", "四川多地暴雨 成都可能发生洪水", "“嘎子”谢孟伟回应直播穿警服骂人", "郑丽文再度高喊打倒“台独”", "上海网红面包店将当日剩余面包扔了", "印军采购阵风并吹嘘击败了中国导弹", "特朗普称再次打击“运毒船”致3死", "下半年来首场大范围冷空气登场", "特朗普：欧洲光说不练这不合规矩", "波兰总理：摧毁一架无人机并逮捕两人", "西藏大一新生合唱《天路》惊艳网友", "山东入室抢婴案将于9月19日一审宣判", "官方回应涉毒艺人将办演唱会", "美财长：欧先对中印征高关税美再跟", "货车拉13头猪有11头“越狱”", "中方呼吁胡塞武装和以色列保持克制", "吉鸿昌将军的重孙参军入伍", "加沙冲突已演变成种族灭绝战争", "卡塔尔称遭以色列卑劣背叛", "女子为方便自己过马路竟扳倒护栏"]

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
