// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.66
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
var default_search_words = ["让铁规矩长出铁牙齿", "香港科技大学：无条件录取哈佛国际生", "特朗普威胁征收50%关税 欧盟回应", "开放是破题之钥 合作是前进之道", "人民日报：过紧日子非削减正当待遇", "吴京车坏在高速路上 没赶上拉力赛", "美政界多人在股票暴跌前精准抛售", "《歌手》第二期排名", "伊藤美诚赢球后泪洒赛场", "林志炫回应被淘汰", "2.5天休假模式真的来了", "养老金个人账户钱能提前取？假", "中国夫妇在澳遭多名青少年殴打", "高速上演“刀片超车” 两车瞬间报废", "特朗普再升级关税威胁 美股指数下跌", "英国女子旅游时去世 回国后心脏没了", "曝蔡依林彭于晏已复合6年", "莫迪：不让巴基斯坦得到一滴水", "董明珠回应孟羽童能否再回格力", "深圳一地惊现10株罕见无叶美冠兰", "邓超发文悼念朱媛媛 狗头表情引争议", "从双修到性暗示 必胜客陷擦边争议", "俄罗斯巨型二战雕塑内发现尸体", "特朗普祝贺俄乌完成战俘交换", "马斯克：很多人不了解中国有多强", "张学友演唱会撞期高考遭多人投诉", "上海一轿车行驶中突然整车离地弹起", "取消哈佛留学生合法身份行为被叫停", "27岁女子肺结节没在意 1年后确诊肺癌", "特朗普政府不断打压哈佛有何目的", "步行者vs尼克斯", "特朗普携6亿美元巨款入场", "教师未发加班福利消极教学 多方回应", "李连杰时隔14年再演武侠", "特朗普把矛头指向欧盟和苹果", "骑行案司机亲属称不起诉拯救了一家", "小伙连吃28天鸡腿饭瘦了10多斤", "武汉暴雨 家长划桨板接娃", "孙颖莎打得韩国选手怀疑起了球拍", "杨天真带8个箱子开始留学生活", "斯坦福牛津：所有大模型都在讨好人类", "乡镇初中生因小官巨贪校长吃不饱", "传重庆一贪官祖坟挖出3公斤金砖", "成都首批城管“飞行员”即将上岗", "外交部回应美政府拿哈佛开刀", "王楚钦孙颖莎晋级混双决赛", "多名老人自驾石九线穿越雪山时翻车", "孩子一觉醒来脸肿成“发面馒头”", "25周超早产儿只有巴掌大小", "外卖盒盛60℃以上食物会释放有毒物质", "专家：驱逐舰下水事故对朝打击重大"]

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
