// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.460
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
var default_search_words = ["习近平同马克龙交流互动的经典瞬间", "公考枪手替考89次敛财千万", "15岁高中生捐赠南京大屠杀日军罪证", "2025你的消费习惯“更新”了吗", "流拍4次的百达翡丽再挂拍 估值4千万", "一身塑料过冬？聚酯纤维真是塑料瓶吗", "李幼斌20年后重现《亮剑》名场面", "危险信号！俄数百辆保时捷突然被锁死", "微信表情包戒烟再度翻红", "中疾控流感防治七问七答", "梅西首夺美职联总冠军", "12岁男孩被体罚跳楼身亡系谣言", "女子裤子内藏2斤多活虫入境被查", "三星堆与秦始皇帝陵竟有联系", "日本友人捐侵华日军家信内容残忍", "今日大雪 要做这些事", "解放军潜艇罕见集群机动", "马克龙发访华集锦视频 用中文感谢", "中美合拍《我的哪吒与变形金刚》首播", "为啥今年流感如此厉害", "大雪时节哪里降雪概率大增", "黑龙江水库冰面下现13匹冰冻马", "镇政府让企业捐200万换正常经营", "劲酒如何成了年轻女性的神仙水", "郭美美、王子柏被点名", "大雪吃三宝是指哪三宝", "中资企业在津遭抢 使馆紧急提醒", "首次！台湾浅滩海域搜救应急演练举行", "确认完最后一步 反诈民警蹲地上哭了", "悬赏10万！陕西男子酒后失踪240多天", "渐冻人姑娘为自己办了场生命告别会", "美国阿拉斯加州发生6.9级地震", "杜三策留下钓鱼岛属于中国的铁证", "生于1999年 闵超已任浙大博导", "日本为何要成立国家情报局", "美乌会谈 俄大规模袭乌", "日本预测东京“直下型地震”后果", "钟南山院士自曝患流感", "下周降温更猛还有大范围雨雪", "2000多年前中国水利设计有多超前", "来古画里感受“踏雪寻诗”的浪漫", "切尔诺贝利核电站保护罩受损", "印度夜店发生火灾造成至少23人死亡", "三项世界级成就见证中国实力", "老君山景区拒用无人机 挑山工发声", "正直播NBA：老鹰vs奇才", "机器人亮出“十八般武艺”", "美国逾60城举行示威活动", "10颗葡萄干里9颗来自吐鲁番", "中俄两军举行第3次反导联合演习", "马克龙将赴伦敦与英德乌领导人会晤"]

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
