// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.304
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
var default_search_words = ["习近平祝贺中国致公党成立100周年", "详讯：习近平同特朗普通电话", "韩国核电站发生泄漏事故", "壁纸上新！中国战机高清大片来了", "第一批iPhone17贴膜受害者出现了", "台湾海峡4.5级地震 福建网友被晃醒", "百岁老人偷玩曾孙玩具 儿子悄悄记录", "俄女子10万卢布出卖灵魂买拉布布", "山姆门店回应卖冷冻2年的西兰花", "专家：美关税把中国竞争对手全打掉了", "宾馆保洁员佩戴金饰遭住客劫杀", "景区辟谣陕西太白山下大雪", "遭老板性侵女子：最受不了人骂我老公", "马来西亚空姐飞行途中跳舞引争议", "小学生站窗外打扫卫生 当地回应", "10岁男孩患上“儿童癌症之王”", "翟欣欣辱骂苏某某语音曝光", "地方反映教师不愿当班主任", "香港发现战时炸弹 6000人紧急疏散", "印媒越吹越离谱：“阵风”领先歼-35A", "驴友秦岭失联遇难 家属起诉救援队", "48岁女子坐超市收银台后弹唱走红", "起底翟欣欣：两次闪婚闪离", "央行调整14天逆回购机制 释放啥信号", "43岁孙艺珍分享极端减肥经历", "老师校内驾车撞伤两小学生 校方回应", "暴雨+雷暴大风 这些地方注意防范", "家人为他信存入1.5万泰铢零用钱", "老太出租房病逝 房东索赔3千被拒", "黄磊称会继续给何炅做饭", "女子翻到去世21年母亲的日记", "女子半夜跑步偷电动滑板车被行拘", "女子双腿麻痒酸胀 确诊不宁腿综合征", "巴基斯坦沙特签军事协议多国受震动", "印度人插队抢购iPhone17大打出手", "香港黄金劫案仍有4人在逃", "青海一“矿霸”非法填埋万吨危废", "新iPhone被吐槽有划痕凹陷 客服回应", "俄核潜艇成功发射高超音速导弹", "知情人士：阿联酋警告了以色列", "韩总理：必要时强力应对个别反华集会", "60岁大叔否认自学上职校是为起号", "美代表否决加沙决议 被指着大骂可耻", "“金庸诉江南”案达成和解", "网友侮辱虚拟偶像被判赔10万韩元", "#美国6次否决加沙停火有何意图#", "女子称吃祖传秘方药丸治病出现幻觉", "25岁小伙南太行徒步失联", "美两党领袖国会走廊擦肩而过零交流", "快手子公司成都快购被立案调查", "“白帝”战机亮相长春航展"]

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
